import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/awards",
    summary="Get Awards",
    description="Get all awards in the contest",
    response_model=List[Dict[str, Any]],
)
async def get_awards(
    contest_id: str = Path(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all awards"""
    return service.get_awards(contest_id)


@router.get(
    "/contests/{contest_id}/awards/{award_id}",
    summary="Get Award",
    description="Get specific award information",
    response_model=Dict[str, Any],
)
async def get_award(
    contest_id: str = Path(..., description="Contest identifier"),
    award_id: str = Path(..., description="Award identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific award information"""
    return service.get_award(contest_id, award_id)
