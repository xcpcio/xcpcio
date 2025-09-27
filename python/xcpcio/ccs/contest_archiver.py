"""
CCS Contest API Archiver
A tool to archive contest data from a CCS API and organize it into a contest package.

Based on the CCS Contest API specification:
https://ccs-specs.icpc.io/2023-06/contest_api

And the Contest Package specification:
https://ccs-specs.icpc.io/2023-06/contest_package
"""

import asyncio
import json
import logging
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional
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
class ArchiveConfig:
    """Configuration for the contest dump operation"""

    base_url: str
    contest_id: str
    credentials: APICredentials
    output_dir: Path
    include_files: bool = True
    endpoints: Optional[List[str]] = None
    timeout: int = 30
    max_concurrent: int = 10
    include_event_feed: bool = False


class ContestArchiver:
    """
    Main class for archiving contest data from CCS API to contest package format.

    This tool fetches data from all relevant API endpoints and organizes them
    according to the Contest Package specification.
    """

    # Known endpoints that can be fetched
    KNOWN_ENDPOINTS = [
        "contests",
        "judgement-types",
        "languages",
        "problems",
        "groups",
        "organizations",
        "teams",
        "persons",
        "accounts",
        "state",
        "submissions",
        "judgements",
        "runs",
        "clarifications",
        "awards",
        "commentary",
        "scoreboard",
    ]

    DOMJUDGE_KNOWN_ENDPOINTS = [
        "contests",
        "judgement-types",
        "languages",
        "problems",
        "groups",
        "organizations",
        "teams",
        "accounts",
        "state",
        "submissions",
        "judgements",
        "runs",
        "clarifications",
        "awards",
        "scoreboard",
    ]

    def __init__(self, config: ArchiveConfig):
        self._config = config
        self._session: Optional[aiohttp.ClientSession] = None
        self._semaphore = asyncio.Semaphore(config.max_concurrent)
        self._api_info: Optional[Dict[str, Any]] = None
        self._provider_name: Optional[str] = None
        self._provider_version: Optional[semver.VersionInfo] = None

        # Create output directory
        self._config.output_dir.mkdir(parents=True, exist_ok=True)

    def _build_url(self, endpoint: str) -> str:
        """Build API URL ensuring proper path joining"""
        # Ensure base_url ends with / and endpoint doesn't start with /
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
        # Setup authentication
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

        # Handle relative URLs
        if not file_url.startswith(("http://", "https://")):
            file_url = self._build_url(file_url)

        async with self._semaphore:
            try:
                return await self._fetch_file_internal(file_url, output_path, override_timeout)
            except Exception as e:
                logger.error(f"Failed to download {file_url} after retries: {e}")
                return False

    def _get_file_output_path(
        self, filename: str, base_path: Optional[str] = None, object_id: Optional[str] = None
    ) -> Path:
        """Get the output path for a file reference"""
        res_dir = self._config.output_dir
        if base_path:
            res_dir /= base_path
        if object_id:
            res_dir /= object_id
        return res_dir / filename

    def _collect_file_references(self, data: Any, base_path: str, object_id: Optional[str] = None) -> List[tuple]:
        """Collect all file references found in data"""
        file_refs = []

        if isinstance(data, dict):
            # Handle file reference objects
            if "href" in data and "filename" in data:
                output_path = self._get_file_output_path(data["filename"], base_path, object_id)
                file_refs.append((data["href"], output_path))

            # Recursively check other dict values
            for value in data.values():
                file_refs.extend(self._collect_file_references(value, base_path, object_id))

        elif isinstance(data, list):
            # Handle arrays of file references or other objects
            for item in data:
                file_refs.extend(self._collect_file_references(item, base_path, object_id))

        return file_refs

    async def _download_file_references(self, data: Any, base_path: str, object_id: Optional[str] = None):
        """Download all file references found in data in parallel"""
        if not self._config.include_files:
            return

        # Collect all file references first
        file_refs = self._collect_file_references(data, base_path, object_id)

        if not file_refs:
            return

        # Download all files in parallel (controlled by self.semaphore)
        download_tasks = [self.fetch_file(href, output_path) for href, output_path in file_refs]

        if download_tasks:
            await asyncio.gather(*download_tasks, return_exceptions=True)

    async def save_data(self, filename: str, data: Any):
        """Save data to file in JSON format"""
        file_path = self._config.output_dir / filename
        content = json.dumps(data, indent=2, ensure_ascii=False)

        async with aiofiles.open(file_path, "w", encoding="utf-8") as f:
            await f.write(content)

        logger.info(f"Saved {file_path}")

    async def dump_api_info(self):
        """Dump API root endpoint information"""
        logger.info("Dumping API information...")

        data = await self.fetch_json("/")
        if not data:
            raise RuntimeError("Failed to fetch API information")

        self._api_info = data  # Store API info for later use

        # Parse provider information
        if "provider" in data:
            provider: Dict = data.get("provider", {})
            self._provider_name = provider.get("name", "")

            # Parse version string to semver.VersionInfo
            version_str: str = provider.get("version", "")
            if version_str:
                try:
                    # Clean version string: "8.3.1/3324986cd" -> "8.3.1", "9.0.0DEV/26e89f701" -> "9.0.0-dev"
                    version_clean = version_str.split("/")[0]
                    # Convert DEV suffix to semver prerelease format
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

        await self.save_data("api.json", data)
        await self._download_file_references(data, "api")

    async def dump_contest_info(self):
        """Dump contest information"""
        logger.info("Dumping contest information...")

        endpoint = f"contests/{self._config.contest_id}"
        data = await self.fetch_json(endpoint)
        if data:
            await self.save_data("contest.json", data)
            await self._download_file_references(data, "contest")

    async def dump_endpoint_collection(self, endpoint: str):
        """Dump a collection endpoint (returns array of objects)"""
        logger.info(f"Dumping {endpoint}...")

        api_endpoint = f"contests/{self._config.contest_id}/{endpoint}"
        data = await self.fetch_json(api_endpoint)

        if data is None:
            return

        await self.save_data(f"{endpoint}.json", data)

        # Download files for each object in the collection
        if isinstance(data, list):
            for item in data:
                if isinstance(item, dict) and "id" in item:
                    await self._download_file_references(item, endpoint, item["id"])

    async def dump_endpoint_single(self, endpoint: str):
        """Dump a single object endpoint"""
        logger.info(f"Dumping {endpoint}...")

        api_endpoint = f"contests/{self._config.contest_id}/{endpoint}"
        data = await self.fetch_json(api_endpoint)

        if data is None:
            return

        await self.save_data(f"{endpoint}.json", data)
        await self._download_file_references(data, endpoint)

    async def dump_event_feed(self):
        """Dump event-feed endpoint with stream=false parameter"""
        logger.info("Dumping event-feed...")

        api_endpoint = f"contests/{self._config.contest_id}/event-feed?stream=false"
        # Use extended timeout for event-feed as it may contain large amounts of data
        await self.fetch_file(
            api_endpoint,
            output_path=self._get_file_output_path("event-feed.ndjson"),
            override_timeout=self._config.timeout * 10,
        )

    async def get_available_endpoints(self) -> List[str]:
        """Get list of available endpoints based on API provider and version"""
        # Check if it's DOMjudge with version < 9.0.0
        if self._provider_name == "DOMjudge" and self._provider_version and self._provider_version.major < 9:
            logger.info(f"Using DOMjudge known endpoints for version < 9.0.0 (detected: {self._provider_version})")
            return self.DOMJUDGE_KNOWN_ENDPOINTS

        # For other providers or DOMjudge >= 9.0.0, try to get from access endpoint
        access_data = await self.fetch_json(f"contests/{self._config.contest_id}/access")

        if not access_data or "endpoints" not in access_data:
            logger.warning("Could not fetch access info, using default endpoints")
            return self.KNOWN_ENDPOINTS

        available = [ep["type"] for ep in access_data["endpoints"]]
        logger.info(f"Available endpoints: {available}")
        return available

    async def dump_all(self):
        """Dump all contest data"""
        logger.info(
            f"Starting contest archive. [base_url={self._config.base_url}] [contest_id={self._config.contest_id}]"
        )

        # Always dump API and contest info
        await self.dump_api_info()
        await self.dump_contest_info()
        await self.dump_endpoint_single("access")

        # Get list of endpoints to dump
        if self._config.endpoints:
            endpoints = self._config.endpoints
        else:
            endpoints = await self.get_available_endpoints()

        # Remove 'contest' endpoint as it's already handled by dump_contest_info
        if "contest" in endpoints:
            endpoints = [ep for ep in endpoints if ep != "contest"]

        # Single object endpoints
        single_endpoints = ["state", "scoreboard"]

        # Collection endpoints
        collection_endpoints = [ep for ep in endpoints if ep not in single_endpoints]

        # Dump all endpoints concurrently
        tasks = []

        for endpoint in single_endpoints:
            if endpoint in endpoints:
                tasks.append(self.dump_endpoint_single(endpoint))

        for endpoint in collection_endpoints:
            if endpoint in endpoints:
                tasks.append(self.dump_endpoint_collection(endpoint))

        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        # Dump event-feed if configured
        if self._config.include_event_feed:
            await self.dump_event_feed()

        logger.info(f"Contest archive completed: {self._config.output_dir}")
