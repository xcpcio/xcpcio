"""
Board Server

Main server class for the XCPCIO Board Server.
"""

import logging

import uvicorn

from .app import create_app
from .config import ServerConfig

logger = logging.getLogger(__name__)


class BoardServer:
    """
    XCPCIO Board Server.

    Serves board frontend and contest data API.
    """

    def __init__(self, config: ServerConfig):
        """
        Initialize the board server.

        Args:
            config: Server configuration
        """
        self.config = config
        self.app = create_app(config)

    def run(self):
        """Run the server."""
        logger.info("Starting XCPCIO Board Server...")
        logger.info(f"Host: {self.config.host}")
        logger.info(f"Port: {self.config.port}")
        logger.info(f"Contests: {len(self.config.contests)}")

        for contest in self.config.contests:
            logger.info(f"  - {contest.path}")

        if self.config.static_dir:
            logger.info(f"Static files: {self.config.static_dir}")

        logger.info(f"API docs at: http://{self.config.host}:{self.config.port}/api/docs")

        uvicorn.run(
            self.app,
            host=self.config.host,
            port=self.config.port,
            log_level=self.config.log_level.lower(),
        )
