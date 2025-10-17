"""
Contest API Server

Main server class implementing the Contest API specification using modern FastAPI architecture.
"""

import logging
from pathlib import Path

import uvicorn

from .app import create_app
from .dependencies import configure_dependencies

logger = logging.getLogger(__name__)


class ContestAPIServer:
    """
    Contest API Server implementing the Contest API specification.

    This server provides REST API endpoints for contest data based on
    the Contest Package format and Contest API specification.
    """

    def __init__(self, contest_package_dir: Path):
        """
        Initialize the Contest API Server.

        Args:
            contest_packages: Dictionary mapping contest_id to contest package directory
        """
        self.contest_package_dir = contest_package_dir
        configure_dependencies(contest_package_dir)
        self.app = create_app()

    def run(
        self,
        host: str = "0.0.0.0",
        port: int = 8000,
        log_level: str = "info",
    ):
        """
        Run the contest API server.

        Args:
            host: Host to bind to
            port: Port to bind to
            log_level: Log level (debug, info, warning, error, critical)
        """

        logger.info("Starting Contest API Server...")
        logger.info(f"Contest package dir: {self.contest_package_dir}")
        logger.info(f"API will be available at: http://{host}:{port}")
        logger.info(f"Interactive docs at: http://{host}:{port}/docs")
        logger.info(f"ReDoc at: http://{host}:{port}/redoc")

        uvicorn.run(
            self.app,
            host=host,
            port=port,
            log_level=log_level,
        )
