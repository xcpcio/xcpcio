import asyncio
import atexit
import hashlib
import logging
import shutil
import tarfile
import tempfile
import zipfile
from pathlib import Path
from typing import Optional

import click
import zstandard as zstd

from xcpcio import __version__
from xcpcio.clics.contest_archiver import APICredentials, ArchiveConfig, ContestArchiver


def setup_logging(level: str = "INFO"):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


def calculate_checksums(file_path: Path) -> dict:
    """Calculate MD5, SHA1, SHA256, SHA512 checksums for a file"""
    md5 = hashlib.md5()
    sha1 = hashlib.sha1()
    sha256 = hashlib.sha256()
    sha512 = hashlib.sha512()

    with open(file_path, "rb") as f:
        while chunk := f.read(8192):
            md5.update(chunk)
            sha1.update(chunk)
            sha256.update(chunk)
            sha512.update(chunk)

    return {
        "md5": md5.hexdigest(),
        "sha1": sha1.hexdigest(),
        "sha256": sha256.hexdigest(),
        "sha512": sha512.hexdigest(),
    }


@click.command()
@click.version_option(__version__)
@click.option("--base-url", required=True, help="Base URL of the CCS API (e.g., https://example.com/api)")
@click.option("--contest-id", required=True, help="Contest ID to dump")
@click.option(
    "--output",
    "-o",
    required=True,
    type=click.Path(path_type=Path),
    help="Output path: directory, or archive file (.zip, .tar.gz, .tar.zst)",
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
    output: Path,
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

        # Output to directory
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o ./output -u admin -p secret

        # Output to ZIP archive
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o contest.zip --token abc123

        # Output to tar.gz archive
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o contest.tar.gz -u admin -p secret

        # Output to tar.zst archive
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o contest.tar.zst -u admin -p secret

        # Only archive specific endpoints
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o ./output -u admin -p secret -e teams -e problems

        # Skip file downloads
        clics-archiver --base-url https://domjudge/api --contest-id contest123 -o ./output --no-files
    """

    if verbose:
        log_level = "DEBUG"

    setup_logging(log_level)

    if not (username and password) and not token:
        click.echo("Warning: No authentication provided. Some endpoints may not be accessible.", err=True)

    output_str = str(output)
    is_archive = output_str.endswith((".zip", ".tar.gz", ".tar.zst"))
    archive_format = None
    temp_dir: Optional[Path] = None

    def cleanup_temp_dir():
        if temp_dir and temp_dir.exists():
            click.echo(f"Cleaning up temporary directory: {temp_dir}")
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                click.echo(f"Warning: Failed to cleanup temporary directory: {e}", err=True)

    atexit.register(cleanup_temp_dir)

    if is_archive:
        if output_str.endswith(".zip"):
            archive_format = "zip"
        elif output_str.endswith(".tar.gz"):
            archive_format = "tar.gz"
        elif output_str.endswith(".tar.zst"):
            archive_format = "tar.zst"

    credentials = APICredentials(username=username, password=password, token=token)

    if is_archive:
        temp_dir = Path(tempfile.mkdtemp(prefix="clics_archive_"))
        output_dir = temp_dir
    else:
        output_dir = output

    config = ArchiveConfig(
        base_url=base_url.rstrip("/"),
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
    if is_archive:
        click.echo(f"Output archive: {output} (format: {archive_format})")
    else:
        click.echo(f"Output directory: {output}")
    if config.endpoints:
        click.echo(f"Endpoints: {', '.join(config.endpoints)}")

    async def run_archive():
        async with ContestArchiver(config) as archiver:
            await archiver.dump_all()

    try:
        asyncio.run(run_archive())

        if is_archive:
            click.echo(f"Creating {archive_format} archive...")
            output.parent.mkdir(parents=True, exist_ok=True)

            if archive_format == "zip":
                with zipfile.ZipFile(output, "w", zipfile.ZIP_DEFLATED) as zipf:
                    for file_path in output_dir.rglob("*"):
                        if file_path.is_file():
                            arcname = file_path.relative_to(output_dir)
                            zipf.write(file_path, arcname)

            elif archive_format == "tar.gz":
                with tarfile.open(output, "w:gz") as tarf:
                    tarf.add(output_dir, arcname=".")

            elif archive_format == "tar.zst":
                with open(output, "wb") as f:
                    cctx = zstd.ZstdCompressor()
                    with cctx.stream_writer(f) as compressor:
                        with tarfile.open(fileobj=compressor, mode="w") as tarf:
                            tarf.add(output_dir, arcname=".")

            click.echo(click.style(f"Contest package created successfully: {output}", fg="green"))
            click.echo("\nChecksums:")
            checksums = calculate_checksums(output)
            click.echo(f"  MD5:    {checksums['md5']}")
            click.echo(f"  SHA1:   {checksums['sha1']}")
            click.echo(f"  SHA256: {checksums['sha256']}")
            click.echo(f"  SHA512: {checksums['sha512']}")
        else:
            click.echo(click.style(f"Contest package created successfully in: {config.output_dir}", fg="green"))
    except KeyboardInterrupt:
        click.echo(click.style("Archive interrupted by user", fg="yellow"), err=True)
        raise click.Abort()
    except Exception as e:
        click.echo(click.style(f"Error during archive: {e}", fg="red"), err=True)
        raise click.ClickException(str(e))


if __name__ == "__main__":
    main()
