import asyncio
import logging
from pathlib import Path
from typing import Optional

import click

from xcpcio import __version__
from xcpcio.ccs.contest_archiver import APICredentials, ArchiveConfig, ContestArchiver


def setup_logging(level: str = "INFO"):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


@click.command()
@click.version_option(__version__)
@click.option("--base-url", required=True, help="Base URL of the CCS API (e.g., https://example.com/api)")
@click.option("--contest-id", required=True, help="Contest ID to dump")
@click.option(
    "--output-dir", required=True, type=click.Path(path_type=Path), help="Output directory for contest package"
)
@click.option("--username", "-u", help="HTTP Basic Auth username")
@click.option("--password", "-p", help="HTTP Basic Auth password")
@click.option("--token", "-t", help="Bearer token for authentication")
@click.option("--no-files", is_flag=True, help="Skip downloading files")
@click.option("--no-event-feed", is_flag=True, help="Skip dump event-feed(large aggregated data)")
@click.option("--endpoints", "-e", multiple=True, help="Specific endpoints to dump (can be used multiple times)")
@click.option("--timeout", default=30, type=int, help="Request timeout in seconds")
@click.option("--max-concurrent", default=10, type=int, help="Max concurrent requests")
@click.option(
    "--log-level",
    default="INFO",
    type=click.Choice(["DEBUG", "INFO", "WARNING", "ERROR"], case_sensitive=False),
    help="Log level",
)
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging (same as --log-level DEBUG)")
def main(
    base_url: str,
    contest_id: str,
    output_dir: Path,
    username: Optional[str],
    password: Optional[str],
    token: Optional[str],
    no_files: bool,
    no_event_feed: bool,
    endpoints: tuple,
    timeout: int,
    max_concurrent: int,
    log_level: str,
    verbose: bool,
):
    """
    Archive CCS Contest API data to contest package format.

    This tool fetches contest data from a CCS API and organizes it into the standard
    contest package format as specified by the CCS Contest Package specification.

    Examples:

        # Basic usage with authentication
        ccs-archiver --base-url https://api.example.com/api --contest-id contest123 --output-dir ./output --username admin --password secret

        # Use bearer token authentication
        ccs-archiver --base-url https://api.example.com/api --contest-id contest123 --output-dir ./output --token abc123

        # Only archive specific endpoints
        ccs-archiver --base-url https://api.example.com/api --contest-id contest123 --output-dir ./output -u admin -p secret -e teams -e problems

        # Skip file downloads
        ccs-archiver --base-url https://api.example.com/api --contest-id contest123 --output-dir ./output --no-files
    """

    if verbose:
        log_level = "DEBUG"

    setup_logging(log_level)

    # Validate authentication
    if not (username and password) and not token:
        click.echo("Warning: No authentication provided. Some endpoints may not be accessible.", err=True)

    # Setup configuration
    credentials = APICredentials(username=username, password=password, token=token)

    config = ArchiveConfig(
        base_url=base_url.rstrip("/"),  # Remove trailing slash
        contest_id=contest_id,
        credentials=credentials,
        output_dir=output_dir,
        include_files=not no_files,
        endpoints=list(endpoints) if endpoints else None,
        timeout=timeout,
        max_concurrent=max_concurrent,
        include_event_feed=not no_event_feed,
    )

    click.echo(f"Archiving contest '{contest_id}' from {base_url}")
    click.echo(f"Output directory: {output_dir}")
    if config.endpoints:
        click.echo(f"Endpoints: {', '.join(config.endpoints)}")

    # Run the archiver
    async def run_archive():
        async with ContestArchiver(config) as archiver:
            await archiver.dump_all()

    try:
        asyncio.run(run_archive())
        click.echo(click.style(f"Contest package created successfully in: {config.output_dir}", fg="green"))
    except KeyboardInterrupt:
        click.echo(click.style("Archive interrupted by user", fg="yellow"), err=True)
        raise click.Abort()
    except Exception as e:
        click.echo(click.style(f"Error during archive: {e}", fg="red"), err=True)
        raise click.ClickException(str(e))


if __name__ == "__main__":
    main()
