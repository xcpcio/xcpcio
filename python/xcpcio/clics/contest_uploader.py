import asyncio
import base64
import hashlib
import json
import logging
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional

from pydantic import BaseModel

from xcpcio.api.client import ApiClient
from xcpcio.api.models import FileData, UploadBoardDataResp
from xcpcio.clics.clics_api_client import APICredentials, ClicsApiClient, ClicsApiConfig

logger = logging.getLogger(__name__)

POLL_INTERVAL = 5


class FileChecksumEntry(BaseModel):
    checksum: str
    updated_at: str


class FileChecksumCacheData(BaseModel):
    checksums: Dict[str, FileChecksumEntry]
    updated_at: str


class FileChecksumCache:
    def __init__(
        self, cache_dir: Optional[Path] = None, contest_id: Optional[str] = None, version: Optional[str] = None
    ):
        if cache_dir:
            cache_dir = Path(cache_dir)
        else:
            cache_dir = Path.home() / ".xcpcio"

        cache_dir.mkdir(parents=True, exist_ok=True)

        if contest_id:
            self.cache_file = cache_dir / f"clics_uploader_{contest_id}.json"
        else:
            self.cache_file = cache_dir / "clics_uploader_cache.json"

        self.version_file = cache_dir / "version"
        self.version = version
        self.checksums: Dict[str, FileChecksumEntry] = {}
        self._load_cache()

    def _load_version(self) -> Optional[str]:
        if self.version_file.exists():
            try:
                with open(self.version_file, "r") as f:
                    return f.read().strip()
            except Exception as e:
                logger.warning(f"Failed to read version file: {e}")
        return None

    def _save_version(self):
        if not self.version:
            return
        try:
            with open(self.version_file, "w") as f:
                f.write(self.version)
        except Exception as e:
            logger.warning(f"Failed to save version file: {e}")

    def _load_cache(self):
        cached_version = self._load_version()
        if cached_version != self.version:
            logger.info(f"Cache version mismatch (cached: {cached_version}, current: {self.version}), clearing cache")
            self.checksums = {}
            return

        if self.cache_file.exists():
            try:
                with open(self.cache_file, "r") as f:
                    data = json.load(f)

                cache_data = FileChecksumCacheData.model_validate(data)
                self.checksums = cache_data.checksums
                logger.debug(f"Loaded cache with {len(self.checksums)} entries")
            except Exception as e:
                logger.warning(f"Failed to load cache: {e}")
                self.checksums = {}

    def _save_cache(self):
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_data = FileChecksumCacheData(
                checksums=self.checksums,
                updated_at=datetime.now().isoformat(),
            )
            with open(self.cache_file, "w") as f:
                json.dump(cache_data.model_dump(), f, indent=2)
            self._save_version()
            logger.debug(f"Saved cache with {len(self.checksums)} entries")
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")

    def calculate_checksum(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def has_changed(self, key: str, content: str) -> bool:
        checksum = self.calculate_checksum(content)
        old_entry = self.checksums.get(key)
        return not old_entry or old_entry.checksum != checksum

    def update_checksum(self, key: str, content: str):
        checksum = self.calculate_checksum(content)
        self.checksums[key] = FileChecksumEntry(
            checksum=checksum,
            updated_at=datetime.now().isoformat(),
        )

    def save(self):
        self._save_cache()


@dataclass
class UploaderConfig:
    clics_base_url: str
    contest_id: str
    clics_credentials: APICredentials
    xcpcio_api_url: str
    xcpcio_api_token: str
    cache_dir: Optional[Path] = None
    timeout: int = 30
    max_concurrent: int = 10
    version: Optional[str] = None

    def to_clics_api_config(self) -> ClicsApiConfig:
        return ClicsApiConfig(
            base_url=self.clics_base_url,
            credentials=self.clics_credentials,
            timeout=self.timeout,
            max_concurrent=self.max_concurrent,
        )


class ContestUploader:
    ENDPOINTS_TO_FETCH = (
        "access",
        "accounts",
        "awards",
        "groups",
        "judgement-types",
        "judgements",
        "languages",
        "organizations",
        "problems",
        "state",
        "submissions",
        "teams",
    )

    def __init__(self, config: UploaderConfig):
        self._config = config
        self._clics_client = ClicsApiClient(config.to_clics_api_config())
        self._api_client = ApiClient(
            base_url=config.xcpcio_api_url,
            token=config.xcpcio_api_token,
            timeout=config.timeout,
        )
        self._cache = FileChecksumCache(
            cache_dir=config.cache_dir,
            contest_id=config.contest_id,
            version=config.version,
        )

    async def __aenter__(self):
        await self._clics_client.__aenter__()
        await self._api_client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self._clics_client.__aexit__(exc_type, exc_val, exc_tb)
        await self._api_client.__aexit__(exc_type, exc_val, exc_tb)

    def _collect_file_references(self, data, base_path: str, object_id: Optional[str] = None):
        file_refs = []

        if isinstance(data, dict):
            if "href" in data and "filename" in data:
                file_refs.append((data["href"], base_path, object_id, data["filename"]))

            for value in data.values():
                file_refs.extend(self._collect_file_references(value, base_path, object_id))

        elif isinstance(data, list):
            for item in data:
                file_refs.extend(self._collect_file_references(item, base_path, object_id))

        return file_refs

    def _is_text_file(self, filename: str) -> bool:
        text_extensions = {".txt", ".md", ".json", ".xml", ".html", ".css", ".js", ".yml", ".yaml", ".svg"}
        return any(filename.lower().endswith(ext) for ext in text_extensions)

    def _process_file_validations(
        self, file_map: Dict[str, FileData], file_keys: list[str], response: UploadBoardDataResp
    ):
        for file_key in file_keys:
            if file_key in file_map:
                validation = response.file_validations.get(file_key)
                if validation:
                    if validation.checksum_valid:
                        self._cache.update_checksum(file_key, file_map[file_key].content)
                    else:
                        logger.warning(f"File checksum validation failed for {file_key}: {validation.message}")
                else:
                    logger.warning(f"No validation result for {file_key}, will retry on next poll")

    def _process_downloaded_file(self, content_bytes: bytes, file_key: str) -> FileData:
        if self._is_text_file(file_key.split("/")[-1]):
            try:
                content_str = content_bytes.decode("utf-8")
                checksum = self._cache.calculate_checksum(content_str)
                logger.debug(f"Downloaded text file: {file_key}")
                return FileData(content=content_str, checksum=checksum)
            except UnicodeDecodeError:
                content_str = base64.b64encode(content_bytes).decode("ascii")
                checksum = self._cache.calculate_checksum(content_str)
                logger.debug(f"Downloaded binary file as base64: {file_key}")
                return FileData(content=content_str, encoding="base64", checksum=checksum)
        else:
            content_str = base64.b64encode(content_bytes).decode("ascii")
            checksum = self._cache.calculate_checksum(content_str)
            logger.debug(f"Downloaded binary file as base64: {file_key}")
            return FileData(content=content_str, encoding="base64", checksum=checksum)

    async def _download_and_collect_files(
        self, data, base_path: str, object_id: Optional[str] = None
    ) -> Dict[str, FileData]:
        file_refs = self._collect_file_references(data, base_path, object_id)

        if not file_refs:
            return {}

        downloaded_files = {}

        download_tasks = []
        for href, base, obj_id, filename in file_refs:
            download_tasks.append((href, base, obj_id, filename))

        for href, base, obj_id, filename in download_tasks:
            try:
                content_bytes = await self._clics_client.fetch_file_content(href)
                if content_bytes:
                    file_path = base
                    if obj_id:
                        file_path = f"{file_path}/{obj_id}"
                    file_key = f"{file_path}/{filename}"
                    downloaded_files[file_key] = self._process_downloaded_file(content_bytes, file_key)
            except Exception as e:
                logger.warning(f"Failed to download file {href}: {e}")

        return downloaded_files

    def _collect_changed_files(self, file_data: FileData, file_key: str) -> tuple[bool, FileData]:
        if self._cache.has_changed(file_key, file_data.content):
            return True, file_data
        return False, file_data

    async def _fetch_contest_data(
        self,
    ) -> tuple[Dict[str, FileData], Dict[str, FileData], list[str], list[str], list[str]]:
        api_files = {}
        extra_files = {}
        changed_api_files = []
        changed_extra_files = []
        unchanged_files = []

        contest_data = await self._clics_client.fetch_json(f"contests/{self._config.contest_id}")
        if contest_data:
            filename = "contest.json"
            content = json.dumps(contest_data, ensure_ascii=False)

            if self._cache.has_changed(filename, content):
                checksum = self._cache.calculate_checksum(content)
                api_files[filename] = FileData(content=content, checksum=checksum)
                changed_api_files.append(filename)
            else:
                unchanged_files.append(filename)

            downloaded_files = await self._download_and_collect_files(contest_data, "contest")
            for file_key, file_data in downloaded_files.items():
                if self._cache.has_changed(file_key, file_data.content):
                    extra_files[file_key] = file_data
                    changed_extra_files.append(file_key)
                else:
                    unchanged_files.append(file_key)

        return api_files, extra_files, changed_api_files, changed_extra_files, unchanged_files

    async def _fetch_endpoint_data(
        self,
        api_files: Dict[str, FileData],
        extra_files: Dict[str, FileData],
        changed_api_files: list[str],
        changed_extra_files: list[str],
        unchanged_files: list[str],
    ):
        for endpoint in self.ENDPOINTS_TO_FETCH:
            data = await self._clics_client.fetch_json(f"contests/{self._config.contest_id}/{endpoint}")
            if data is not None:
                filename = f"{endpoint}.json"
                content = json.dumps(data, ensure_ascii=False)

                if self._cache.has_changed(filename, content):
                    checksum = self._cache.calculate_checksum(content)
                    api_files[filename] = FileData(content=content, checksum=checksum)
                    changed_api_files.append(filename)
                else:
                    unchanged_files.append(filename)

                if isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and "id" in item:
                            downloaded_files = await self._download_and_collect_files(item, endpoint, item["id"])
                            for file_key, file_data in downloaded_files.items():
                                if self._cache.has_changed(file_key, file_data.content):
                                    extra_files[file_key] = file_data
                                    changed_extra_files.append(file_key)
                                else:
                                    unchanged_files.append(file_key)

    async def _upload_api_files(
        self, api_files: Dict[str, FileData], changed_api_files: list[str]
    ) -> Optional[UploadBoardDataResp]:
        if not api_files:
            return None

        logger.info(f"Uploading {len(api_files)} API file(s) to Board Admin...")
        response = await self._api_client.upload_board_data(extra_files=api_files)
        logger.info(f"API upload successful! ({len(api_files)} files)")

        self._process_file_validations(api_files, changed_api_files, response)
        self._cache.save()
        return response

    async def _upload_extra_files(self, extra_files: Dict[str, FileData]) -> Optional[UploadBoardDataResp]:
        if not extra_files:
            return None

        file_items = list(extra_files.items())
        batch_size = 50
        total_batches = (len(file_items) + batch_size - 1) // batch_size
        last_response = None

        for batch_idx in range(total_batches):
            start_idx = batch_idx * batch_size
            end_idx = min(start_idx + batch_size, len(file_items))
            batch = dict(file_items[start_idx:end_idx])
            batch_keys = list(batch.keys())

            logger.info(f"Uploading batch {batch_idx + 1}/{total_batches} ({len(batch)} files) to Board Admin...")
            batch_response = await self._api_client.upload_board_data(extra_files=batch)
            logger.info(f"Batch {batch_idx + 1}/{total_batches} upload successful! ({len(batch)} files)")

            self._process_file_validations(batch, batch_keys, batch_response)
            self._cache.save()
            last_response = batch_response

        return last_response

    async def fetch_and_upload(self) -> Optional[Dict]:
        await self._clics_client.fetch_api_info()

        (
            api_files,
            extra_files,
            changed_api_files,
            changed_extra_files,
            unchanged_files,
        ) = await self._fetch_contest_data()
        await self._fetch_endpoint_data(api_files, extra_files, changed_api_files, changed_extra_files, unchanged_files)

        if changed_api_files:
            logger.info(f"Changed API files ({len(changed_api_files)}): {', '.join(changed_api_files)}")
        if changed_extra_files:
            logger.info(f"Changed extra files ({len(changed_extra_files)}): {', '.join(changed_extra_files)}")
        if unchanged_files:
            logger.debug(f"Unchanged files ({len(unchanged_files)}): {', '.join(unchanged_files)}")

        if not api_files and not extra_files:
            logger.info("No changed files to upload")
            return None

        last_response = await self._upload_api_files(api_files, changed_api_files)
        extra_response = await self._upload_extra_files(extra_files)

        if extra_response:
            last_response = extra_response

        logger.info(f"All uploads completed! (API: {len(api_files)}, Extra: {len(extra_files)} files)")
        return last_response.model_dump() if last_response else None

    async def run_loop(self, poll_interval: int = POLL_INTERVAL):
        iteration = 0
        while True:
            iteration += 1
            try:
                logger.info(f"[Iteration #{iteration}] Starting fetch and upload...")
                await self.fetch_and_upload()
            except Exception as e:
                logger.error(f"Error during fetch and upload: {e}", exc_info=True)

            logger.info(f"Waiting {poll_interval} seconds until next poll...")
            await asyncio.sleep(poll_interval)
