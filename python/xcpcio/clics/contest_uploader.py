import asyncio
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
    poll_interval: int = 5
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

    async def _fetch_api_data(
        self,
        api_files: Dict[str, FileData],
        changed_api_files: list[str],
        unchanged_files: list[str],
    ):
        api_data = await self._clics_client.fetch_api_info()
        if api_data:
            filename = "api.json"
            content = json.dumps(api_data, ensure_ascii=False)

            if self._cache.has_changed(filename, content):
                checksum = self._cache.calculate_checksum(content)
                api_files[filename] = FileData(content=content, checksum=checksum)
                changed_api_files.append(filename)
            else:
                unchanged_files.append(filename)

    async def _fetch_contest_data(
        self,
    ) -> tuple[Dict[str, FileData], list[str], list[str]]:
        api_files = {}
        changed_api_files = []
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

        return api_files, changed_api_files, unchanged_files

    async def _fetch_endpoint_data(
        self,
        api_files: Dict[str, FileData],
        changed_api_files: list[str],
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

    async def _upload_api_files(
        self, api_files: Dict[str, FileData], changed_api_files: list[str]
    ) -> Optional[UploadBoardDataResp]:
        if not api_files:
            return None

        logger.info(f"Uploading {len(api_files)} API file(s) to XCPCIO...")
        response = await self._api_client.upload_board_data(extra_files=api_files)
        logger.info(f"API upload successful! ({len(api_files)} files)")

        self._process_file_validations(api_files, changed_api_files, response)
        self._cache.save()
        return response

    async def fetch_and_upload(self) -> Optional[Dict]:
        api_files, changed_api_files, unchanged_files = ({}, [], [])

        await self._fetch_api_data(api_files, changed_api_files, unchanged_files)

        contest_files, contest_changed, contest_unchanged = await self._fetch_contest_data()
        api_files.update(contest_files)
        changed_api_files.extend(contest_changed)
        unchanged_files.extend(contest_unchanged)

        await self._fetch_endpoint_data(api_files, changed_api_files, unchanged_files)

        if changed_api_files:
            logger.info(f"Changed API files ({len(changed_api_files)}): {', '.join(changed_api_files)}")
        if unchanged_files:
            logger.debug(f"Unchanged files ({len(unchanged_files)}): {', '.join(unchanged_files)}")

        if not api_files:
            logger.info("No changed files to upload")
            return None

        response = await self._upload_api_files(api_files, changed_api_files)

        logger.info(f"All uploads completed! ({len(api_files)} files)")
        return response.model_dump() if response else None

    async def run_loop(self):
        iteration = 0
        while True:
            iteration += 1
            try:
                logger.info(f"[Iteration #{iteration}] Starting fetch and upload...")
                await self.fetch_and_upload()
            except Exception as e:
                logger.exception(f"Error during fetch and upload: {e}", exc_info=True)

            logger.info(f"Waiting {self._config.poll_interval} seconds until next poll...")
            await asyncio.sleep(self._config.poll_interval)
