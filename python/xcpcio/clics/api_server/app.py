"""
Contest API Server Application

FastAPI application instance for Contest API Server.
This module can be used directly with uvicorn for reload support.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from xcpcio.__version__ import __version__

from .routes import create_router


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        Configured FastAPI application instance
    """
    app = FastAPI(
        title="Contest API Server",
        description="REST API for Contest Control System specifications",
        version=__version__,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    router = create_router()
    app.include_router(router)

    return app
