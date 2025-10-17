import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/clarifications",
    summary="Get all the clarifications for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_clarifications(
    contest_id: str = Path(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_clarifications(contest_id)


@router.get(
    "/contests/{contest_id}/clarifications/{clarification_id}",
    summary="Get the given clarifications for this contest",
    response_model=Dict[str, Any],
)
async def get_clarification(
    contest_id: str = Path(..., description="Contest identifier"),
    clarification_id: str = Path(..., description="Clarification identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_clarification(contest_id, clarification_id)
