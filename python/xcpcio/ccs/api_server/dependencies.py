"""
FastAPI Dependencies

Dependency injection system for Contest API Server.
"""

from pathlib import Path
from typing import Annotated

from fastapi import Depends

from .services.contest_service import ContestService

# Global contest service instance cache
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
    _contest_service_instance = ContestService(contest_package_dir)


# Type alias for dependency injection
ContestServiceDep = Annotated[ContestService, Depends(get_contest_service)]
