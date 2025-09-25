import logging
from typing import Any, Dict

from fastapi import APIRouter

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/access",
    summary="Get Access Information",
    description="Get access capabilities and visible endpoints for current client",
    response_model=Dict[str, Any],
)
async def get_access(contest_id: str, service: ContestServiceDep) -> Dict[str, Any]:
    """Get access information for the current client"""
    return service.get_access_info(contest_id)
