import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ...model import (
    Group,
    Groups,
)
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/groups",
    summary="Get Groups",
    description="Get all team groups in the contest",
    response_model=Groups,
)
async def get_groups(
    contest_id: str = Path(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all groups"""
    return service.get_groups(contest_id)


@router.get(
    "/contests/{contest_id}/groups/{group_id}",
    summary="Get Group",
    description="Get specific group information",
    response_model=Group,
)
async def get_group(
    contest_id: str = Path(..., description="Contest identifier"),
    group_id: str = Path(..., description="Group identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific group information"""
    return service.get_group(contest_id, group_id)
