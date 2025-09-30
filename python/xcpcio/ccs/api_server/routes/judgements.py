import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/judgements",
    summary="Get all the judgements for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_judgements(
    contest_id: str = Path(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_judgements(contest_id)


@router.get(
    "/contests/{contest_id}/judgements/{judgement_id}",
    summary="Get the given judgement for this contest",
    response_model=Dict[str, Any],
)
async def get_judgement(
    contest_id: str = Path(..., description="Contest identifier"),
    judgement_id: str = Path(..., description="Judgement identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_judgement(contest_id, judgement_id)
