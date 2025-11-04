import asyncio
import logging
from pathlib import Path
from typing import Optional

import click

from xcpcio import __version__
from xcpcio.clics.clics_api_client import APICredentials
from xcpcio.clics.contest_uploader import ContestUploader, UploaderConfig


def setup_logging(level: str = "INFO"):
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


@click.command()
@click.version_option(__version__)
@click.option("--base-url", required=True, help="Base URL of the CLICS API (e.g., https://domjudge/api)")
@click.option("--contest-id", required=True, help="Contest ID to fetch")
@click.option("--username", "-u", required=True, help="HTTP Basic Auth username for CLICS API")
@click.option("--password", "-p", required=True, help="HTTP Basic Auth password for CLICS API")
@click.option("--xcpcio-api-url", default="https://api.xcpcio.com", help="XCPCIO API URL")
@click.option("--xcpcio-api-token", required=True, help="XCPCIO API token")
@click.option(
    "--cache-dir", type=click.Path(path_type=Path), help="Directory for checksum cache files (default: ~/.xcpcio/)"
)
@click.option("--timeout", default=30, type=int, help="Request timeout in seconds")
@click.option("--max-concurrent", default=10, type=int, help="Max concurrent requests for CLICS API")
@click.option("--interval", default=5, type=int, help="Polling interval in seconds")
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
    username: str,
    password: str,
    xcpcio_api_url: str,
    xcpcio_api_token: str,
    cache_dir: Optional[Path],
    timeout: int,
    max_concurrent: int,
    interval: int,
    log_level: str,
    verbose: bool,
):
    """
    Upload CLICS Contest API data to XCPCIO with polling support.

    This tool fetches contest data from a CLICS API and uploads raw JSON data to the xcpcio board-admin service.
    It continuously polls every 5 seconds and uses SHA256 checksums to avoid uploading unchanged files.

    Examples:

        clics-uploader --base-url https://domjudge/api --contest-id contest123 -u admin -p secret --xcpcio-api-token YOUR_TOKEN
    """

    if verbose:
        log_level = "DEBUG"

    setup_logging(log_level)

    credentials = APICredentials(username=username, password=password)
    config = UploaderConfig(
        clics_base_url=base_url.rstrip("/"),
        contest_id=contest_id,
        clics_credentials=credentials,
        xcpcio_api_url=xcpcio_api_url,
        xcpcio_api_token=xcpcio_api_token,
        cache_dir=cache_dir,
        timeout=timeout,
        max_concurrent=max_concurrent,
        poll_interval=interval,
        version=__version__,
    )

    click.echo(f"Fetching contest '{contest_id}' from {base_url}")
    click.echo(f"Uploading to XCPCIO: {xcpcio_api_url}")

    async def run():
        async with ContestUploader(config) as uploader:
            await uploader.run_loop()

    try:
        asyncio.run(run())
    except KeyboardInterrupt:
        click.echo(click.style("\nClics Uploader stopped by user", fg="yellow"), err=True)
        raise click.Abort()
    except Exception as e:
        click.echo(click.style(f"Error: {e}", fg="red"), err=True)
        raise click.ClickException(str(e))


if __name__ == "__main__":
    main()
