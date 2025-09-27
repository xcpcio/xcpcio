import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Path, Query

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/clarifications",
    summary="Get Clarifications",
    description="Get all clarifications, optionally filtered",
    response_model=List[Dict[str, Any]],
)
async def get_clarifications(
    contest_id: str = Path(..., description="Contest identifier"),
    from_team_id: Optional[str] = Query(None, description="Filter by sender team ID (empty string for null)"),
    to_team_id: Optional[str] = Query(None, description="Filter by recipient team ID (empty string for null)"),
    problem_id: Optional[str] = Query(None, description="Filter by problem ID (empty string for null)"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    """Get all clarifications, optionally filtered"""
    return service.get_clarifications(contest_id, from_team_id, to_team_id, problem_id)


@router.get(
    "/contests/{contest_id}/clarifications/{clarification_id}",
    summary="Get Clarification",
    description="Get specific clarification information",
    response_model=Dict[str, Any],
)
async def get_clarification(
    contest_id: str = Path(..., description="Contest identifier"),
    clarification_id: str = Path(..., description="Clarification identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific clarification information"""
    return service.get_clarification(contest_id, clarification_id)
