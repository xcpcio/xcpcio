import asyncio
import hashlib
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Optional

from xcpcio.api.client import ApiClient
from xcpcio.clics.clics_api_client import APICredentials, ClicsApiClient, ClicsApiConfig

logger = logging.getLogger(__name__)

POLL_INTERVAL = 5


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
        self.checksums: Dict[str, str] = {}
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

                self.checksums = data.get("checksums", {})
                logger.debug(f"Loaded cache with {len(self.checksums)} entries")
            except Exception as e:
                logger.warning(f"Failed to load cache: {e}")
                self.checksums = {}

    def _save_cache(self):
        try:
            self.cache_file.parent.mkdir(parents=True, exist_ok=True)
            cache_data = {"checksums": self.checksums}
            with open(self.cache_file, "w") as f:
                json.dump(cache_data, f, indent=2)
            self._save_version()
            logger.debug(f"Saved cache with {len(self.checksums)} entries")
        except Exception as e:
            logger.warning(f"Failed to save cache: {e}")

    def calculate_checksum(self, content: str) -> str:
        return hashlib.sha256(content.encode("utf-8")).hexdigest()

    def has_changed(self, key: str, content: str) -> bool:
        checksum = self.calculate_checksum(content)
        old_checksum = self.checksums.get(key)

        if old_checksum != checksum:
            self.checksums[key] = checksum
            return True
        return False

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
        "clarifications",
        "groups",
        "judgement-types",
        "judgements",
        "languages",
        "organizations",
        "problems",
        "runs",
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

    async def fetch_and_upload(self) -> Optional[Dict]:
        await self._clics_client.fetch_api_info()

        extra_files = {}
        changed_files = []
        unchanged_files = []

        contest_data = await self._clics_client.fetch_json(f"contests/{self._config.contest_id}")
        if contest_data:
            filename = "contest.json"
            content = json.dumps(contest_data, ensure_ascii=False)

            if self._cache.has_changed(filename, content):
                extra_files[filename] = content
                changed_files.append(filename)
            else:
                unchanged_files.append(filename)

        for endpoint in self.ENDPOINTS_TO_FETCH:
            data = await self._clics_client.fetch_json(f"contests/{self._config.contest_id}/{endpoint}")
            if data is not None:
                filename = f"{endpoint}.json"
                content = json.dumps(data, ensure_ascii=False)

                if self._cache.has_changed(filename, content):
                    extra_files[filename] = content
                    changed_files.append(filename)
                else:
                    unchanged_files.append(filename)

        if changed_files:
            logger.info(f"Changed files ({len(changed_files)}): {', '.join(changed_files)}")
        if unchanged_files:
            logger.debug(f"Unchanged files ({len(unchanged_files)}): {', '.join(unchanged_files)}")

        if not extra_files:
            logger.info("No changed files to upload")
            return None

        logger.info(f"Uploading {len(extra_files)} file(s) to Board Admin...")
        response = await self._api_client.upload_board_data(extra_files=extra_files)
        self._cache.save()
        logger.info(f"Upload successful! ({len(extra_files)} files)")
        return response.model_dump()

    async def run_loop(self, poll_interval: int = POLL_INTERVAL):
        iteration = 0
        while True:
            iteration += 1
            try:
                logger.info(f"[Iteration #{iteration}] Starting fetch and upload...")
                await self.fetch_and_upload()
            except Exception as e:
                logger.error(f"Error during fetch and upload: {e}", exc_info=True)
                raise

            logger.info(f"Waiting {poll_interval} seconds until next poll...")
            await asyncio.sleep(poll_interval)
