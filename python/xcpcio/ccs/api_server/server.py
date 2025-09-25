"""
Contest API Server

Main server class implementing the Contest API specification using modern FastAPI architecture.
"""

import logging
from pathlib import Path

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from xcpcio.__version__ import __version__

from .dependencies import configure_dependencies
from .routes import create_router

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

        # Configure dependency injection for multi-contest mode
        # This might need adjustment based on how dependencies work
        configure_dependencies(contest_package_dir)

        # Create FastAPI application
        self.app = FastAPI(
            title="Contest API Server",
            description="REST API for Contest Control System specifications",
            version=__version__,
            docs_url="/docs",
            redoc_url="/redoc",
            openapi_url="/openapi.json",
        )

        # Add CORS middleware
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Include all routes
        router = create_router()
        self.app.include_router(router)

    def run(self, host: str = "0.0.0.0", port: int = 8000, reload: bool = True, log_level: str = "info"):
        """
        Run the contest API server.

        Args:
            host: Host to bind to
            port: Port to bind to
            reload: Enable auto-reload for development
            log_level: Log level (debug, info, warning, error, critical)
        """

        logger.info("Starting Contest API Server...")
        logger.info(f"Contest package dir: {self.contest_package_dir}")
        logger.info(f"API will be available at: http://{host}:{port}")
        logger.info(f"Interactive docs at: http://{host}:{port}/docs")
        logger.info(f"ReDoc at: http://{host}:{port}/redoc")

        uvicorn.run(self.app, host=host, port=port, reload=reload, log_level=log_level)
