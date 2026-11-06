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
    etag: Optional[str] = None
    last_modified: Optional[str] = None


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
        return self.has_checksum_changed(key, self.calculate_checksum(content))

    def has_checksum_changed(self, key: str, checksum: str) -> bool:
        old_entry = self.checksums.get(key)
        return not old_entry or old_entry.checksum != checksum

    def update_checksum(self, key: str, content: str):
        self.update_checksum_value(key, self.calculate_checksum(content))

    def get_entry(self, key: str) -> Optional[FileChecksumEntry]:
        return self.checksums.get(key)

    def update_checksum_value(
        self,
        key: str,
        checksum: str,
        etag: Optional[str] = None,
        last_modified: Optional[str] = None,
    ):
        self.checksums[key] = FileChecksumEntry(
            checksum=checksum,
            updated_at=datetime.now().isoformat(),
            etag=etag,
            last_modified=last_modified,
        )

    def remove_checksum(self, key: str):
        self.checksums.pop(key, None)

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
    ssl_verify: bool = True
    ssl_ca_cert: Optional[Path] = None
    upload_logo: bool = False

    def to_clics_api_config(self) -> ClicsApiConfig:
        return ClicsApiConfig(
            base_url=self.clics_base_url,
            credentials=self.clics_credentials,
            timeout=self.timeout,
            max_concurrent=self.max_concurrent,
            ssl_verify=self.ssl_verify,
            ssl_ca_cert=self.ssl_ca_cert,
        )


@dataclass
class OrganizationLogoFile:
    path: str
    content: bytes
    checksum: str
    etag: Optional[str] = None
    last_modified: Optional[str] = None


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
    ) -> list[OrganizationLogoFile]:
        logo_files: list[OrganizationLogoFile] = []

        for endpoint in self.ENDPOINTS_TO_FETCH:
            data = await self._clics_client.fetch_json(f"contests/{self._config.contest_id}/{endpoint}")
            if data is not None:
                filename = f"{endpoint}.json"
                content = json.dumps(data, ensure_ascii=False)
                changed = self._cache.has_changed(filename, content)

                if changed:
                    checksum = self._cache.calculate_checksum(content)
                    api_files[filename] = FileData(content=content, checksum=checksum)
                    changed_api_files.append(filename)
                else:
                    unchanged_files.append(filename)

                if endpoint == "organizations" and self._config.upload_logo and isinstance(data, list):
                    logo_files = await self._fetch_logo_data(data, refresh_all=changed)

        return logo_files

    @staticmethod
    def _is_safe_path_segment(segment: str) -> bool:
        return bool(segment) and segment not in {".", ".."} and "/" not in segment and "\\" not in segment

    def _collect_organization_logos(self, organizations: list[Dict]) -> list[tuple[str, str]]:
        logos: list[tuple[str, str]] = []

        for org in organizations:
            org_id = org.get("id", "")
            if not self._is_safe_path_segment(str(org_id)):
                logger.warning(f"Skip organization logo with invalid organization id: {org_id!r}")
                continue

            for logo in org.get("logo") or []:
                filename = str(logo.get("filename", ""))
                href = logo.get("href")

                if not href:
                    continue
                if not self._is_safe_path_segment(filename):
                    logger.warning(
                        f"Skip organization logo with invalid filename. [org_id={org_id}] [filename={filename!r}]"
                    )
                    continue

                logos.append((f"organizations/{org_id}/{filename}", href))

        return logos

    async def _fetch_logo_data(
        self,
        organizations: list[Dict],
        refresh_all: bool,
    ) -> list[OrganizationLogoFile]:
        logos = self._collect_organization_logos(organizations)
        if not logos:
            logger.debug("No organization logos found")
            return []

        # Logos with cached validators are revalidated with If-None-Match / If-Modified-Since on every poll.
        # Logos without validators are only downloaded when the organizations data changed or they are unknown,
        # otherwise every poll would download all of them again just to compute their checksums.
        requests: list[tuple[str, str, Optional[str], Optional[str]]] = []
        for key, href in logos:
            entry = self._cache.get_entry(key)

            if entry is None:
                requests.append((key, href, None, None))
            elif entry.etag or entry.last_modified:
                requests.append((key, href, entry.etag, entry.last_modified))
            elif refresh_all:
                requests.append((key, href, None, None))

        if not requests:
            logger.debug(f"Organization logos unchanged ({len(logos)}), skip fetching")
            return []

        results = await asyncio.gather(
            *(
                self._clics_client.fetch_file_content_with_metadata(href, etag, last_modified)
                for _, href, etag, last_modified in requests
            ),
            return_exceptions=True,
        )

        changed_files: list[OrganizationLogoFile] = []
        failed_count = 0
        not_modified_count = 0

        for (key, href, etag, last_modified), result in zip(requests, results):
            if isinstance(result, BaseException):
                logger.error(f"Failed to fetch organization logo. [key={key}] [href={href}] [err={result}]")
                failed_count += 1
                continue

            if result is None:
                logger.warning(f"Failed to fetch organization logo. [key={key}] [href={href}]")
                failed_count += 1
                continue

            if result.content is None:
                not_modified_count += 1
                continue

            checksum = hashlib.sha256(result.content).hexdigest()
            entry = self._cache.get_entry(key)

            if entry is not None and entry.checksum == checksum:
                # Content is unchanged, but the validators may have changed (e.g. the server rotated the ETag).
                self._cache.update_checksum_value(key, checksum, result.etag, result.last_modified)
                not_modified_count += 1
                continue

            changed_files.append(
                OrganizationLogoFile(
                    path=key,
                    content=result.content,
                    checksum=checksum,
                    etag=result.etag,
                    last_modified=result.last_modified,
                )
            )

        logger.info(
            f"Organization logos: {len(logos)} in total, {len(requests)} checked, "
            f"{len(changed_files)} changed, {not_modified_count} not modified, {failed_count} failed"
        )

        return changed_files

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

    async def _upload_logo_file(self, logo: OrganizationLogoFile) -> bool:
        try:
            validation = await self._api_client.upload_board_file(logo.path, logo.content, logo.checksum)
        except Exception as e:
            logger.error(f"Failed to upload organization logo. [path={logo.path}] [err={e}]")
            self._cache.remove_checksum(logo.path)
            return False

        if not validation.checksum_valid:
            logger.warning(f"File checksum validation failed for {logo.path}: {validation.message}")
            self._cache.remove_checksum(logo.path)
            return False

        self._cache.update_checksum_value(logo.path, logo.checksum, logo.etag, logo.last_modified)
        return True

    async def _upload_logo_files(self, logo_files: list[OrganizationLogoFile]):
        if not logo_files:
            return

        logger.info(f"Uploading {len(logo_files)} organization logo(s) to XCPCIO...")

        semaphore = asyncio.Semaphore(self._config.max_concurrent)

        async def upload(logo: OrganizationLogoFile) -> bool:
            async with semaphore:
                return await self._upload_logo_file(logo)

        results = await asyncio.gather(*(upload(logo) for logo in logo_files), return_exceptions=True)
        uploaded_count = sum(1 for result in results if result is True)

        self._cache.save()
        logger.info(f"Organization logos uploaded: {uploaded_count}, failed: {len(logo_files) - uploaded_count}")

    async def fetch_and_upload(self) -> Optional[Dict]:
        api_files, changed_api_files, unchanged_files = ({}, [], [])

        await self._fetch_api_data(api_files, changed_api_files, unchanged_files)

        contest_files, contest_changed, contest_unchanged = await self._fetch_contest_data()
        api_files.update(contest_files)
        changed_api_files.extend(contest_changed)
        unchanged_files.extend(contest_unchanged)

        logo_files = await self._fetch_endpoint_data(api_files, changed_api_files, unchanged_files)

        if changed_api_files:
            preview = changed_api_files[:20]
            suffix = (
                f" ... (+{len(changed_api_files) - len(preview)} more)" if len(changed_api_files) > len(preview) else ""
            )
            logger.info(f"Changed API files ({len(changed_api_files)}): {', '.join(preview)}{suffix}")
        if unchanged_files:
            logger.debug(f"Unchanged files ({len(unchanged_files)}): {', '.join(unchanged_files)}")

        response = None
        if api_files:
            response = await self._upload_api_files(api_files, changed_api_files)

        if logo_files:
            await self._upload_logo_files(logo_files)

        if not api_files and not logo_files:
            logger.info("No changed files to upload")
            return None

        logger.info(f"All uploads completed! ({len(api_files)} file(s), {len(logo_files)} logo(s))")
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
