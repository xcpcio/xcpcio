import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/judgement-types",
    summary="Get Judgement Types",
    description="Get all judgement types available in the contest",
    response_model=List[Dict[str, Any]],
)
async def get_judgement_types(
    contest_id: str = Path(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all judgement types"""
    return service.get_judgement_types(contest_id)


@router.get(
    "/contests/{contest_id}/judgement-types/{judgement_type_id}",
    summary="Get Judgement Type",
    description="Get specific judgement type information",
    response_model=Dict[str, Any],
)
async def get_judgement_type(
    contest_id: str = Path(..., description="Contest identifier"),
    judgement_type_id: str = Path(..., description="Judgement type identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific judgement type information"""
    return service.get_judgement_type(contest_id, judgement_type_id)
