import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Path, Query

from ...model import Judgement, Judgements
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/judgements",
    summary="Get Judgements",
    description="Get all judgements, optionally filtered by submission",
    response_model=Judgements,
)
async def get_judgements(
    contest_id: str = Path(..., description="Contest identifier"),
    submission_id: Optional[str] = Query(None, description="Filter judgements by submission ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    """Get all judgements, optionally filtered by submission"""
    return service.get_judgements(contest_id, submission_id)


@router.get(
    "/contests/{contest_id}/judgements/{judgement_id}",
    summary="Get Judgement",
    description="Get specific judgement information",
    response_model=Judgement,
)
async def get_judgement(
    contest_id: str = Path(..., description="Contest identifier"),
    judgement_id: str = Path(..., description="Judgement identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific judgement information"""
    return service.get_judgement(contest_id, judgement_id)
