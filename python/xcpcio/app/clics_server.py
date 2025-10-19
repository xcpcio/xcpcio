import atexit
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
from xcpcio.clics.api_server.server import ContestAPIServer


def setup_logging(level: str = "INFO"):
    """Setup logging configuration"""
    logging.basicConfig(
        level=getattr(logging, level.upper()),
        format="%(asctime)s [%(name)s] %(filename)s:%(lineno)d %(levelname)s: %(message)s",
    )


def extract_archive(archive_path: Path, dest_dir: Path) -> None:
    """Extract archive to destination directory"""
    archive_str = str(archive_path)

    if archive_str.endswith(".zip"):
        with zipfile.ZipFile(archive_path, "r") as zipf:
            zipf.extractall(dest_dir)
    elif archive_str.endswith(".tar.gz"):
        with tarfile.open(archive_path, "r:gz") as tarf:
            tarf.extractall(dest_dir, filter="data")
    elif archive_str.endswith(".tar.zst"):
        with tempfile.NamedTemporaryFile(suffix=".tar") as tmp_tar:
            with open(archive_path, "rb") as f:
                dctx = zstd.ZstdDecompressor()
                dctx.copy_stream(f, tmp_tar)
            tmp_tar.seek(0)
            with tarfile.open(fileobj=tmp_tar, mode="r") as tarf:
                tarf.extractall(dest_dir, filter="data")
    else:
        raise ValueError(f"Unsupported archive format: {archive_path}")


@click.command()
@click.version_option(__version__)
@click.option(
    "--contest-package",
    "-p",
    required=True,
    type=click.Path(exists=True, path_type=Path),
    help="Contest package directory or archive file (.zip, .tar.gz, .tar.zst)",
)
@click.option("--host", default="0.0.0.0", help="Host to bind to")
@click.option("--port", default=8000, type=int, help="Port to bind to")
@click.option(
    "--log-level",
    default="info",
    type=click.Choice(["debug", "info", "warning", "error", "critical"], case_sensitive=False),
    help="Log level",
)
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose logging (same as --log-level debug)")
def main(contest_package: Path, host: str, port: int, log_level: str, verbose: bool):
    """
    Start the Contest API Server.

    Examples:

        # Start server with contest directory
        clics-server -p /path/to/contest

        # Start server with archive file
        clics-server -p /path/to/contest.zip
        clics-server -p /path/to/contest.tar.gz
        clics-server -p /path/to/contest.tar.zst

        # Custom host and port
        clics-server -p /path/to/contest --host 127.0.0.1 --port 9000
    """
    if verbose:
        log_level = "debug"
    setup_logging(log_level.upper())

    temp_dir: Optional[Path] = None

    def cleanup_temp_dir():
        if temp_dir and temp_dir.exists():
            click.echo(f"Cleaning up temporary directory: {temp_dir}")
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                click.echo(f"Warning: Failed to cleanup temporary directory: {e}", err=True)

    atexit.register(cleanup_temp_dir)

    actual_contest_dir: Path = contest_package
    is_archive = str(contest_package).endswith((".zip", ".tar.gz", ".tar.zst"))

    if is_archive:
        if not contest_package.is_file():
            click.echo(f"Error: Archive file not found: {contest_package}", err=True)
            raise click.Abort()

        click.echo(f"Extracting archive: {contest_package}")
        temp_dir = Path(tempfile.mkdtemp(prefix="clics_package_"))

        try:
            extract_archive(contest_package, temp_dir)
            actual_contest_dir = temp_dir
            click.echo(f"Archive extracted to: {temp_dir}")
        except Exception as e:
            click.echo(f"Error extracting archive: {e}", err=True)
            raise click.Abort()
    else:
        if not contest_package.is_dir():
            click.echo(f"Error: Contest directory not found: {contest_package}", err=True)
            raise click.Abort()

    click.echo("Starting Contest API Server...")
    click.echo(f"Contest directory: {actual_contest_dir}")
    click.echo(f"Host: {host}")
    click.echo(f"Port: {port}")
    click.echo(f"Log level: {log_level}")

    try:
        server = ContestAPIServer(actual_contest_dir)
        server.run(host=host, port=port, log_level=log_level.lower())
    except KeyboardInterrupt:
        click.echo("\nServer stopped by user")
    except Exception as e:
        click.echo(f"Error starting server: {e}", err=True)
        raise click.Abort()


if __name__ == "__main__":
    main()
