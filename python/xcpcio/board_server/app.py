"""
Board Server Application Factory

FastAPI application factory for the XCPCIO Board Server.
"""

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from xcpcio.__version__ import __version__

from .config import ServerConfig
from .routes import board_router
from .services import BoardDataCache

logger = logging.getLogger(__name__)


class StaticFileServer:
    """
    Serves board frontend static files with variable injection.
    """

    def __init__(
        self,
        static_dir: Path,
        cdn_host: str = "",
        data_host: str = "",
        data_region: str = "",
        default_lang: str = "en",
        refetch_interval: int = 30000,  # milliseconds
    ):
        self.static_dir = static_dir
        self.cdn_host = cdn_host
        self.data_host = data_host
        self.data_region = data_region
        self.default_lang = default_lang
        self.refetch_interval = refetch_interval

        self._index_html_cache: Optional[str] = None

    def _inject_variables(self, html: str) -> str:
        """Inject runtime variables into HTML."""
        # Look for window variable assignments and replace them
        # This is a simple approach - more sophisticated injection could use a template

        # Inject variables as a script block if not already present
        injection_script = f"""<script>
window.CDN_HOST = "{self.cdn_host}";
window.DATA_HOST = "{self.data_host}";
window.DATA_REGION = "{self.data_region}";
window.DEFAULT_LANG = "{self.default_lang}";
window.REFETCH_INTERVAL = {self.refetch_interval};
</script>"""

        # Insert before closing </head> tag
        if "</head>" in html:
            html = html.replace("</head>", f"{injection_script}\n</head>")
        elif "<body" in html:
            # Fallback: insert before <body>
            body_pos = html.find("<body")
            html = html[:body_pos] + injection_script + "\n" + html[body_pos:]

        return html

    def get_index_html(self) -> str:
        """Get processed index.html content."""
        if self._index_html_cache is None:
            index_path = self.static_dir / "index.html"
            if not index_path.exists():
                raise FileNotFoundError(f"index.html not found in {self.static_dir}")
            with open(index_path, "r", encoding="utf-8") as f:
                html = f.read()
            self._index_html_cache = self._inject_variables(html)
        return self._index_html_cache

    def clear_cache(self):
        """Clear index.html cache."""
        self._index_html_cache = None


def create_app(config: ServerConfig) -> FastAPI:
    """
    Create and configure FastAPI application.

    Args:
        config: Server configuration

    Returns:
        Configured FastAPI application instance
    """
    # Create data cache and register contests
    data_cache = BoardDataCache()
    for contest in config.contests:
        data_cache.register_contest(contest)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        """Application lifespan manager."""
        # Startup
        logger.info("Starting board server...")
        await data_cache.start()

        yield

        # Shutdown
        logger.info("Stopping board server...")
        await data_cache.stop()

    app = FastAPI(
        title="XCPCIO Board Server",
        description="Board data server for XCPCIO leaderboard visualization",
        version=__version__,
        docs_url="/api/docs",
        redoc_url="/api/redoc",
        openapi_url="/api/openapi.json",
        lifespan=lifespan,
    )

    # Store data cache in app state
    app.state.data_cache = data_cache

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include board data routes
    app.include_router(board_router, tags=["Board Data"])

    # Static file serving (if configured)
    if config.static_dir and config.static_dir.exists():
        # Determine data_host (default to self)
        data_host = config.data_host or "/data/"

        static_server = StaticFileServer(
            static_dir=config.static_dir,
            cdn_host=config.cdn_host,
            data_host=data_host,
            refetch_interval=config.default_refresh_interval * 1000,
        )

        # Mount static files for assets
        assets_dir = config.static_dir / "assets"
        if assets_dir.exists():
            app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

        # SPA fallback route - must be added after other routes
        @app.get("/{full_path:path}")
        async def serve_spa(request: Request, full_path: str):
            """Serve SPA fallback for client-side routing."""
            # Skip /data/ paths (handled by board router)
            if full_path.startswith("data/"):
                return None

            # Skip /api/ paths
            if full_path.startswith("api/"):
                return None

            # Try to serve static file
            static_file = config.static_dir / full_path
            if static_file.is_file():
                return FileResponse(static_file)

            # SPA fallback - serve index.html
            try:
                return HTMLResponse(content=static_server.get_index_html())
            except FileNotFoundError:
                return HTMLResponse(content="<h1>Board frontend not found</h1>", status_code=404)

        # Root route
        @app.get("/")
        async def serve_root():
            """Serve root page."""
            try:
                return HTMLResponse(content=static_server.get_index_html())
            except FileNotFoundError:
                return HTMLResponse(content="<h1>Board frontend not found</h1>", status_code=404)

    return app
