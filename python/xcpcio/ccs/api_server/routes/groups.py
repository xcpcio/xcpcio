import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/groups",
    summary="Get all the groups for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_groups(
    contest_id: str = Path(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_groups(contest_id)


@router.get(
    "/contests/{contest_id}/groups/{group_id}",
    summary="Get the given group for this contest",
    response_model=Dict[str, Any],
)
async def get_group(
    contest_id: str = Path(..., description="Contest identifier"),
    group_id: str = Path(..., description="Group identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_group(contest_id, group_id)
