"""
XCPCIO Board Server

A FastAPI-based server that reads contest data from CLICS API or local contest packages
and serves it in XCPCIO Board format for the leaderboard visualization frontend.
"""

from .config import ContestConfig, ServerConfig
from .server import BoardServer

__all__ = [
    "BoardServer",
    "ContestConfig",
    "ServerConfig",
]
