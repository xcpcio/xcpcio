"""
FastAPI Dependencies

Dependency injection system for Contest API Server.
"""

from pathlib import Path
from typing import Annotated, Dict

from fastapi import Depends

from xcpcio.clics.reader import BaseContestReader, ContestPackageReader

from .services import ContestService

_contest_service_instance = None


def get_contest_service() -> ContestService:
    """
    Dependency that provides ContestService instance.

    This is configured by the main server class and cached globally.

    Returns:
        ContestService instance

    Raises:
        RuntimeError: If service not configured
    """
    global _contest_service_instance
    if _contest_service_instance is None:
        raise RuntimeError("ContestService not configured. Call configure_dependencies() first.")
    return _contest_service_instance


def configure_dependencies(contest_package_dir: Path) -> None:
    """
    Configure the dependency injection system.

    Args:
        contest_package_dir: Path to contest package directory
    """
    global _contest_service_instance
    reader_dict: Dict[str, BaseContestReader] = {}
    contest_package_reader = ContestPackageReader(contest_package_dir)
    reader_dict[contest_package_reader.get_contest_id()] = contest_package_reader
    _contest_service_instance = ContestService(reader_dict)


# Type alias for dependency injection
ContestServiceDep = Annotated[ContestService, Depends(get_contest_service)]
