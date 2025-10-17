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
from typing import Any, List, Optional

import aiofiles

from xcpcio.clics.clics_api_client import APICredentials, ClicsApiClient, ClicsApiConfig

logger = logging.getLogger(__name__)


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

    def to_api_config(self) -> ClicsApiConfig:
        """Convert to ClicsApiConfig"""
        return ClicsApiConfig(
            base_url=self.base_url,
            credentials=self.credentials,
            timeout=self.timeout,
            max_concurrent=self.max_concurrent,
        )


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
        self._client = ClicsApiClient(config.to_api_config())

        self._config.output_dir.mkdir(parents=True, exist_ok=True)

    async def __aenter__(self):
        """Async context manager entry"""
        await self._client.__aenter__()
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self._client.__aexit__(exc_type, exc_val, exc_tb)

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

        download_tasks = [self._client.fetch_file(href, output_path) for href, output_path in file_refs]

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

        data = await self._client.fetch_api_info()
        if not data:
            raise RuntimeError("Failed to fetch API information")

        await self.save_data("api.json", data)
        await self._download_file_references(data, "api")

    async def dump_contest_info(self):
        """Dump contest information"""
        logger.info("Dumping contest information...")

        endpoint = f"contests/{self._config.contest_id}"
        data = await self._client.fetch_json(endpoint)
        if data:
            await self.save_data("contest.json", data)
            await self._download_file_references(data, "contest")

    async def dump_endpoint_collection(self, endpoint: str):
        """Dump a collection endpoint (returns array of objects)"""
        logger.info(f"Dumping {endpoint}...")

        api_endpoint = f"contests/{self._config.contest_id}/{endpoint}"
        data = await self._client.fetch_json(api_endpoint)

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
        data = await self._client.fetch_json(api_endpoint)

        if data is None:
            return

        await self.save_data(f"{endpoint}.json", data)
        await self._download_file_references(data, endpoint)

    async def dump_event_feed(self):
        """Dump event-feed endpoint with stream=false parameter"""
        logger.info("Dumping event-feed...")

        api_endpoint = f"contests/{self._config.contest_id}/event-feed?stream=false"
        await self._client.fetch_file(
            api_endpoint,
            output_path=self._get_file_output_path("event-feed.ndjson"),
            override_timeout=self._config.timeout * 10,
        )

    async def get_available_endpoints(self) -> List[str]:
        """Get list of available endpoints based on API provider and version"""
        provider_name = self._client.provider_name
        provider_version = self._client.provider_version

        if provider_name == "DOMjudge" and provider_version and provider_version.major < 9:
            logger.info(f"Using DOMjudge known endpoints for version < 9.0.0 (detected: {provider_version})")
            return self.DOMJUDGE_KNOWN_ENDPOINTS

        access_data = await self._client.fetch_json(f"contests/{self._config.contest_id}/access")

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
