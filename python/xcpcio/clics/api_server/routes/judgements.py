import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Path, Query

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
    submission_id: Optional[str] = Query(None, description="Filter judgements by submission ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_judgements(contest_id, submission_id)


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
