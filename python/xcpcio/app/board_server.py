"""
Board Server CLI Entry Point

Command-line interface for the XCPCIO Board Server.
"""

import logging
from pathlib import Path
from typing import Optional

import click

from xcpcio import __version__
from xcpcio.board_server.config import ContestConfig, ServerConfig, load_config_from_yaml
from xcpcio.board_server.server import BoardServer
from xcpcio.clics.clics_api_client import APICredentials


def setup_logging(level: str = "INFO"):
    """Setup logging configuration."""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


@click.command()
@click.version_option(__version__)
@click.option(
    "--config",
    "-c",
    type=click.Path(exists=True, path_type=Path),
    help="Configuration file (YAML)",
)
@click.option(
    "--api-url",
    help="CLICS API URL for remote contest data",
)
@click.option(
    "--contest-id",
    "--cid",
    help="Contest ID for API source",
)
@click.option(
    "--username",
    "-u",
    help="API username for authentication",
)
@click.option(
    "--password",
    "-p",
    help="API password for authentication",
)
@click.option(
    "--contest-path",
    default="",
    help="URL path for the contest (default: root)",
)
@click.option(
    "--static-dir",
    type=click.Path(exists=True, path_type=Path),
    help="Board frontend static files directory",
)
@click.option("--host", default="0.0.0.0", help="Host to bind to")
@click.option("--port", default=3000, type=int, help="Port to bind to")
@click.option("--refresh-interval", default=30, type=int, help="Data refresh interval (seconds)")
@click.option(
    "--log-level",
    default="info",
    type=click.Choice(["debug", "info", "warning", "error", "critical"], case_sensitive=False),
    help="Log level",
)
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging (same as --log-level debug)")
def main(
    config: Optional[Path],
    api_url: Optional[str],
    contest_id: Optional[str],
    username: Optional[str],
    password: Optional[str],
    contest_path: str,
    static_dir: Optional[Path],
    host: str,
    port: int,
    refresh_interval: int,
    log_level: str,
    verbose: bool,
):
    """
    Start the XCPCIO Board Server.

    The board server reads contest data from a CLICS API, converts it to
    XCPCIO Board format, and serves it via a FastAPI web server.

    Examples:

        # Using config file
        board-server -c config.yaml

        # From CLICS API (e.g., DOMjudge)
        board-server --api-url https://domjudge/api --cid 1 --contest-path live

        # With authentication
        board-server --api-url https://domjudge/api --cid 1 \\
            --username admin --password secret --contest-path live

        # With frontend static files
        board-server --api-url https://domjudge/api --cid 1 \\
            --static-dir /path/to/board/dist
    """
    if verbose:
        log_level = "debug"
    setup_logging(log_level.upper())

    # Build configuration
    if config:
        # Load from YAML file
        try:
            server_config = load_config_from_yaml(config)
        except Exception as e:
            click.echo(f"Error loading config file: {e}", err=True)
            raise click.Abort()

        # Override with CLI options if provided
        if host != "0.0.0.0":
            server_config.host = host
        if port != 8000:
            server_config.port = port
        if static_dir:
            server_config.static_dir = static_dir
        if log_level != "info":
            server_config.log_level = log_level

    else:
        # Build from CLI options
        if not api_url:
            click.echo("Error: --api-url is required (or use -c/--config)", err=True)
            raise click.Abort()

        if not contest_id:
            click.echo("Error: --contest-id is required when using --api-url", err=True)
            raise click.Abort()

        credentials = None
        if username or password:
            credentials = APICredentials(username=username, password=password)

        contests = [
            ContestConfig(
                path=contest_path or "contest",
                api_url=api_url,
                contest_id=contest_id,
                credentials=credentials,
                refresh_interval=refresh_interval,
            )
        ]

        server_config = ServerConfig(
            host=host,
            port=port,
            static_dir=static_dir,
            contests=contests,
            default_refresh_interval=refresh_interval,
            log_level=log_level,
        )

    if not server_config.contests:
        click.echo("Error: No contests configured", err=True)
        raise click.Abort()

    # Start server
    click.echo("Starting XCPCIO Board Server...")
    click.echo(f"Host: {server_config.host}")
    click.echo(f"Port: {server_config.port}")
    click.echo(f"Contests: {len(server_config.contests)}")
    for contest in server_config.contests:
        click.echo(f"  - {contest.path} (api_url={contest.api_url})")

    if server_config.static_dir:
        click.echo(f"Static files: {server_config.static_dir}")

    server = BoardServer(server_config)

    try:
        server.run()
    except KeyboardInterrupt:
        click.echo("\nServer stopped by user")
    except Exception as e:
        click.echo(f"Error starting server: {e}", err=True)
        raise click.Abort()


if __name__ == "__main__":
    main()
