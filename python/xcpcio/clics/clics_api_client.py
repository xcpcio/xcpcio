"""
CLICS API Client
A reusable client for interacting with CLICS (Contest Logging for ICPC Systems) APIs.

Based on the CCS Contest API specification:
https://ccs-specs.icpc.io/2023-06/contest_api
"""

import asyncio
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional
from urllib.parse import urljoin

import aiofiles
import aiohttp
import semver
from tenacity import before_sleep_log, retry, retry_if_exception_type, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)


@dataclass
class APICredentials:
    """API authentication credentials"""

    username: Optional[str] = None
    password: Optional[str] = None
    token: Optional[str] = None


@dataclass
class ClicsApiConfig:
    """Configuration for CLICS API client"""

    base_url: str
    credentials: APICredentials
    timeout: int = 30
    max_concurrent: int = 10


class ClicsApiClient:
    """
    Client for interacting with CLICS (Contest Logging for ICPC Systems) APIs.

    Provides async methods for fetching JSON data and downloading files from
    CLICS-compliant contest management systems.
    """

    def __init__(self, config: ClicsApiConfig):
        self._config = config
        self._session: Optional[aiohttp.ClientSession] = None
        self._semaphore = asyncio.Semaphore(config.max_concurrent)
        self._api_info: Optional[Dict[str, Any]] = None
        self._provider_name: Optional[str] = None
        self._provider_version: Optional[semver.VersionInfo] = None

    def _build_url(self, endpoint: str) -> str:
        """Build API URL ensuring proper path joining"""
        base = self._config.base_url.rstrip("/") + "/"
        endpoint = endpoint.lstrip("/")
        return urljoin(base, endpoint)

    async def __aenter__(self):
        """Async context manager entry"""
        await self.start_session()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close_session()

    async def start_session(self):
        """Initialize the HTTP session with authentication"""
        auth = None
        headers = {}

        if self._config.credentials.username and self._config.credentials.password:
            auth = aiohttp.BasicAuth(self._config.credentials.username, self._config.credentials.password)
        elif self._config.credentials.token:
            headers["Authorization"] = f"Bearer {self._config.credentials.token}"

        self._session = aiohttp.ClientSession(auth=auth, headers=headers)

    async def close_session(self):
        """Close the HTTP session"""
        if self._session:
            await self._session.close()

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((asyncio.TimeoutError, aiohttp.ClientError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    async def _fetch_json_internal(self, url: str, override_timeout: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Internal fetch method with retry logic"""
        logger.info(f"Fetching {url}")
        timeout = aiohttp.ClientTimeout(total=override_timeout or self._config.timeout)
        async with self._session.get(url, timeout=timeout) as response:
            if response.status == 404:
                logger.warning(f"Endpoint not found: {url}")
                return None
            elif response.status != 200:
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info, history=response.history, status=response.status
                )

            data = await response.json()
            logger.debug(f"Fetched {len(str(data))} bytes from {url}")
            return data

    async def fetch_json(self, endpoint: str, override_timeout: Optional[int] = None) -> Optional[Dict[str, Any]]:
        """Fetch JSON data from an API endpoint"""
        url = self._build_url(endpoint)

        async with self._semaphore:
            try:
                return await self._fetch_json_internal(url, override_timeout)
            except Exception as e:
                logger.error(f"Failed to fetch. [url={url}] [err={e}]")
                return None

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((asyncio.TimeoutError, aiohttp.ClientError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    async def _fetch_file_internal(
        self, file_url: str, output_path: Path, override_timeout: Optional[int] = None
    ) -> bool:
        """Internal file download method with retry logic"""
        logger.info(f"Downloading {file_url} -> {output_path}")
        output_path.parent.mkdir(parents=True, exist_ok=True)

        timeout = aiohttp.ClientTimeout(total=override_timeout or self._config.timeout)
        async with self._session.get(file_url, timeout=timeout) as response:
            if response.status != 200:
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info, history=response.history, status=response.status
                )

            async with aiofiles.open(output_path, "wb") as f:
                async for chunk in response.content.iter_chunked(8192):
                    await f.write(chunk)

        logger.debug(f"Downloaded {output_path}")
        return True

    async def fetch_file(
        self, file_url: Optional[str], output_path: Path, override_timeout: Optional[int] = None
    ) -> bool:
        """Download a file from URL to local path"""
        if not file_url:
            return False

        if not file_url.startswith(("http://", "https://")):
            file_url = self._build_url(file_url)

        async with self._semaphore:
            try:
                return await self._fetch_file_internal(file_url, output_path, override_timeout)
            except Exception as e:
                logger.error(f"Failed to download {file_url} after retries: {e}")
                return False

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry=retry_if_exception_type((asyncio.TimeoutError, aiohttp.ClientError)),
        before_sleep=before_sleep_log(logger, logging.WARNING),
        reraise=True,
    )
    async def _fetch_file_content_internal(self, file_url: str, override_timeout: Optional[int] = None) -> bytes:
        """Internal method to fetch file content as bytes with retry logic"""
        logger.info(f"Fetching file content from {file_url}")
        timeout = aiohttp.ClientTimeout(total=override_timeout or self._config.timeout)
        async with self._session.get(file_url, timeout=timeout) as response:
            if response.status != 200:
                raise aiohttp.ClientResponseError(
                    request_info=response.request_info, history=response.history, status=response.status
                )

            content = await response.read()
            logger.debug(f"Fetched {len(content)} bytes from {file_url}")
            return content

    async def fetch_file_content(self, file_url: Optional[str], override_timeout: Optional[int] = None) -> Optional[bytes]:
        """Fetch file content as bytes from URL"""
        if not file_url:
            return None

        if not file_url.startswith(("http://", "https://")):
            file_url = self._build_url(file_url)

        async with self._semaphore:
            try:
                return await self._fetch_file_content_internal(file_url, override_timeout)
            except Exception as e:
                logger.error(f"Failed to fetch file content from {file_url} after retries: {e}")
                return None

    async def fetch_api_info(self) -> Optional[Dict[str, Any]]:
        """Fetch API root endpoint information and parse provider details"""
        data = await self.fetch_json("/")
        if not data:
            return None

        self._api_info = data

        if "provider" in data:
            provider: Dict = data.get("provider", {})
            self._provider_name = provider.get("name", "")

            version_str: str = provider.get("version", "")
            if version_str:
                try:
                    version_clean = version_str.split("/")[0]
                    if version_clean.endswith("DEV"):
                        version_clean = version_clean[:-3] + "-dev"

                    self._provider_version = semver.VersionInfo.parse(version_clean)
                    logger.info(
                        f"Detected API provider: {self._provider_name} version {version_str} (parsed: {self._provider_version})"
                    )
                except (ValueError, TypeError) as e:
                    logger.warning(f"Could not parse version string: {version_str}, error: {e}")
                    self._provider_version = None
            else:
                logger.info(f"Detected API provider: {self._provider_name} (no version)")

        return data

    @property
    def api_info(self) -> Optional[Dict[str, Any]]:
        """Get cached API information"""
        return self._api_info

    @property
    def provider_name(self) -> Optional[str]:
        """Get the detected API provider name"""
        return self._provider_name

    @property
    def provider_version(self) -> Optional[semver.VersionInfo]:
        """Get the detected API provider version"""
        return self._provider_version
