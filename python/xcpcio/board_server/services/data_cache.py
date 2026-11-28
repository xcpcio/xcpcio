"""
Board Data Cache Service

Manages caching and periodic refresh of board data from CLICS API sources.
"""

import asyncio
import logging
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional

from xcpcio.clics.reader import ContestApiReader

from ..config import ContestConfig
from ..converters.clics_to_board import ClicsToBoardConverter

logger = logging.getLogger(__name__)


@dataclass
class CachedBoardData:
    """Cached board data for a single contest."""

    config: Dict[str, Any]
    teams: Dict[str, Any]
    submissions: List[Dict[str, Any]]
    organizations: List[Dict[str, Any]]
    last_updated: datetime

    def to_board_data(self) -> Dict[str, Any]:
        """Convert to combined BoardData format."""
        return {
            "contest": self.config,
            "teams": self.teams,
            "submissions": self.submissions,
            "organizations": self.organizations,
        }


@dataclass
class ContestSource:
    """Internal configuration for a single contest source."""

    contest_path: str
    config: ContestConfig
    refresh_interval: int

    reader: Optional[ContestApiReader] = field(default=None, repr=False)
    converter: Optional[ClicsToBoardConverter] = field(default=None, repr=False)


class BoardDataCache:
    """
    Manages caching and periodic refresh of board data.

    Supports multiple contests with independent refresh intervals.
    Works with CLICS APIs.
    """

    def __init__(self):
        self._contests: Dict[str, ContestSource] = {}
        self._cache: Dict[str, CachedBoardData] = {}
        self._refresh_tasks: Dict[str, asyncio.Task] = {}
        self._running = False

    def register_contest(self, config: ContestConfig) -> None:
        """
        Register a contest for data serving.

        Args:
            config: Contest configuration
        """
        contest_path = config.path

        reader = ContestApiReader(
            base_url=config.api_url,
            contest_id=config.contest_id,
            credentials=config.credentials,
        )

        converter = ClicsToBoardConverter(reader)

        source = ContestSource(
            contest_path=contest_path,
            config=config,
            refresh_interval=config.refresh_interval,
            reader=reader,
            converter=converter,
        )

        self._contests[contest_path] = source
        logger.info(f"Registered contest: {contest_path} (api_url={config.api_url})")

    async def _load_initial_data(self, contest_path: str) -> None:
        """Load initial data for a contest."""
        source = self._contests.get(contest_path)
        if not source:
            return

        # Load data asynchronously
        await source.reader.load_data()

        # Refresh and cache data
        await self._refresh_contest_data(contest_path)

    async def _refresh_contest_data(self, contest_path: str) -> None:
        """Refresh data for a specific contest."""
        source = self._contests.get(contest_path)
        if not source or not source.converter:
            return

        try:
            # Reload data from API
            await source.reader.load_data()

            # Convert data
            converted = source.converter.convert_all()

            self._cache[contest_path] = CachedBoardData(
                config=converted["contest"],
                teams=converted["teams"],
                submissions=converted["submissions"],
                organizations=converted["organizations"],
                last_updated=datetime.now(),
            )

            logger.debug(f"Refreshed data for contest: {contest_path}")

        except Exception as e:
            logger.error(f"Failed to refresh contest {contest_path}: {e}")

    async def _refresh_loop(self, contest_path: str) -> None:
        """Background refresh loop for a contest."""
        source = self._contests.get(contest_path)
        if not source:
            return

        while self._running:
            await asyncio.sleep(source.refresh_interval)
            if not self._running:
                break
            await self._refresh_contest_data(contest_path)

    async def start(self) -> None:
        """Start background refresh tasks for all contests."""
        self._running = True

        # Load initial data for all contests
        init_tasks = []
        for contest_path in self._contests:
            init_tasks.append(self._load_initial_data(contest_path))

        if init_tasks:
            await asyncio.gather(*init_tasks, return_exceptions=True)

        # Start refresh loops
        for contest_path in self._contests:
            task = asyncio.create_task(self._refresh_loop(contest_path))
            self._refresh_tasks[contest_path] = task

        logger.info(f"Started refresh tasks for {len(self._contests)} contests")

    async def stop(self) -> None:
        """Stop all background refresh tasks."""
        self._running = False

        for task in self._refresh_tasks.values():
            task.cancel()

        if self._refresh_tasks:
            await asyncio.gather(*self._refresh_tasks.values(), return_exceptions=True)

        self._refresh_tasks.clear()
        logger.info("Stopped all refresh tasks")

    def get_config(self, contest_path: str) -> Dict[str, Any]:
        """Get cached config for a contest."""
        if contest_path not in self._cache:
            raise KeyError(f"Contest not found: {contest_path}")
        return self._cache[contest_path].config

    def get_teams(self, contest_path: str) -> Dict[str, Any]:
        """Get cached teams for a contest."""
        if contest_path not in self._cache:
            raise KeyError(f"Contest not found: {contest_path}")
        return self._cache[contest_path].teams

    def get_submissions(self, contest_path: str) -> List[Dict[str, Any]]:
        """Get cached submissions for a contest."""
        if contest_path not in self._cache:
            raise KeyError(f"Contest not found: {contest_path}")
        return self._cache[contest_path].submissions

    def get_organizations(self, contest_path: str) -> List[Dict[str, Any]]:
        """Get cached organizations for a contest."""
        if contest_path not in self._cache:
            raise KeyError(f"Contest not found: {contest_path}")
        return self._cache[contest_path].organizations

    def get_board_data(self, contest_path: str) -> Dict[str, Any]:
        """Get combined board data for a contest."""
        if contest_path not in self._cache:
            raise KeyError(f"Contest not found: {contest_path}")
        return self._cache[contest_path].to_board_data()

    def get_contest_paths(self) -> List[str]:
        """Get list of registered contest paths."""
        return list(self._contests.keys())

    def is_contest_registered(self, contest_path: str) -> bool:
        """Check if a contest is registered."""
        return contest_path in self._contests
