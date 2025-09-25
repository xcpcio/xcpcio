import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Path, Query

from ...model import Run, Runs
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/runs",
    summary="Get Runs",
    description="Get all test case runs, optionally filtered by judgement",
    response_model=Runs,
)
async def get_runs(
    contest_id: str = Path(..., description="Contest identifier"),
    judgement_id: Optional[str] = Query(None, description="Filter runs by judgement ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    """Get all test case runs, optionally filtered by judgement"""
    return service.get_runs(contest_id, judgement_id)


@router.get(
    "/contests/{contest_id}/runs/{run_id}",
    summary="Get Run",
    description="Get specific test case run information",
    response_model=Run,
)
async def get_run(
    contest_id: str = Path(..., description="Contest identifier"),
    run_id: str = Path(..., description="Run identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific test case run information"""
    return service.get_run(contest_id, run_id)
