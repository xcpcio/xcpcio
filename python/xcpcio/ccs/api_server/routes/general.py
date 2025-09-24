import logging
from datetime import datetime
from typing import Any, Dict

from fastapi import APIRouter

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/",
    summary="API Information",
    description="Get API version and provider information",
    response_model=Dict[str, Any],
)
async def get_api_info(service: ContestServiceDep) -> Dict[str, Any]:
    """Get API information and provider details"""
    return service.get_api_info()


@router.get("/health", summary="Health Check", description="Check server health status", response_model=Dict[str, Any])
async def health_check(service: ContestServiceDep) -> Dict[str, Any]:
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "contest_package": str(service.contest_package_dir),
        "api_version": "2023-06",
    }
