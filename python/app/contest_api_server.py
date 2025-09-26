import logging
from pathlib import Path

import click

from xcpcio import __version__
from xcpcio.ccs.api_server.server import ContestAPIServer


def setup_logging(level: str = "INFO"):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


@click.command()
@click.version_option(__version__)
@click.option(
    "--contest-dir",
    "-d",
    required=True,
    type=click.Path(exists=True, file_okay=False, dir_okay=True, path_type=Path),
    help="Contest package directory path",
)
@click.option("--host", default="0.0.0.0", help="Host to bind to")
@click.option("--port", default=8000, type=int, help="Port to bind to")
@click.option("--reload", is_flag=True, help="Enable auto-reload for development")
@click.option(
    "--log-level",
    default="info",
    type=click.Choice(["debug", "info", "warning", "error", "critical"], case_sensitive=False),
    help="Log level",
)
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging (same as --log-level debug)")
def main(contest_dir: Path, host: str, port: int, reload: bool, log_level: str, verbose: bool):
    """
    Start the Contest API Server.

    Examples:

        # Start server with contest directory
        contest-api-server -d /path/to/contest

        # Custom host and port
        contest-api-server -d /path/to/contest --host 127.0.0.1 --port 9000

        # Enable reload for development
        contest-api-server -d /path/to/contest --reload
    """
    # Setup logging
    if verbose:
        log_level = "debug"
    setup_logging(log_level.upper())

    # Display configuration
    click.echo("Starting Contest API Server...")
    click.echo(f"Contest directory: {contest_dir}")
    click.echo(f"Host: {host}")
    click.echo(f"Port: {port}")
    click.echo(f"Reload: {reload}")
    click.echo(f"Log level: {log_level}")

    # Create and run server
    try:
        server = ContestAPIServer(contest_dir)
        server.run(host=host, port=port, reload=reload, log_level=log_level.lower())
    except KeyboardInterrupt:
        click.echo("\nServer stopped by user")
    except Exception as e:
        click.echo(f"Error starting server: {e}", err=True)
        raise click.Abort()


if __name__ == "__main__":
    main()
