"""
Board Server Configuration

Configuration models for the board server using CLICS API sources.
"""

from pathlib import Path
from typing import List, Optional, Union

import yaml
from pydantic import BaseModel, Field

from xcpcio.clics.clics_api_client import APICredentials


class ContestConfig(BaseModel):
    """Configuration for a single contest source."""

    # URL path for the contest (e.g., "icpc/2024/wf")
    path: str = Field(..., description="URL path for the contest")

    # API source configuration
    api_url: str = Field(..., description="CLICS API base URL")
    contest_id: str = Field(..., description="Contest ID for API source")
    credentials: Optional[APICredentials] = Field(default=None, description="API credentials")

    # Common configuration
    refresh_interval: int = Field(default=30, description="Data refresh interval in seconds")


class ServerConfig(BaseModel):
    """Board server configuration."""

    # Server binding
    host: str = Field(default="0.0.0.0", description="Server host")
    port: int = Field(default=8000, description="Server port")

    # Static files
    static_dir: Optional[Path] = Field(default=None, description="Board frontend static files directory")
    cdn_host: str = Field(default="", description="CDN host for static assets")
    data_host: str = Field(default="", description="Data API host (defaults to self)")

    # Contests configuration
    contests: List[ContestConfig] = Field(default_factory=list)

    # Default settings
    default_refresh_interval: int = Field(default=30, description="Default refresh interval in seconds")

    # Logging
    log_level: str = Field(default="info", description="Log level")


def load_config_from_yaml(config_path: Union[str, Path]) -> ServerConfig:
    """
    Load server configuration from a YAML file.

    Args:
        config_path: Path to the YAML configuration file

    Returns:
        ServerConfig instance
    """
    config_path = Path(config_path)

    with open(config_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)

    # Convert credentials dict to APICredentials if present
    if "contests" in data:
        for contest in data["contests"]:
            if "credentials" in contest and isinstance(contest["credentials"], dict):
                contest["credentials"] = APICredentials(**contest["credentials"])

    return ServerConfig(**data)
