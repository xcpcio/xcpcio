import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/runs",
    summary="Get Runs",
    description="Get all test case runs, optionally filtered by judgement",
    response_model=List[Dict[str, Any]],
)
async def get_runs(
    contest_id: str = Path(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_runs(contest_id)


@router.get(
    "/contests/{contest_id}/runs/{run_id}",
    summary="Get Run",
    description="Get specific test case run information",
    response_model=Dict[str, Any],
)
async def get_run(
    contest_id: str = Path(..., description="Contest identifier"),
    run_id: str = Path(..., description="Run identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_run(contest_id, run_id)
