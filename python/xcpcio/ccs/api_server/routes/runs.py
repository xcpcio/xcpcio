import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Path, Query

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/runs",
    summary="Get all the runs for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_runs(
    contest_id: str = Path(..., description="Contest identifier"),
    judgement_id: Optional[str] = Query(None, description="Filter runs by judgement ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_runs(contest_id, judgement_id)


@router.get(
    "/contests/{contest_id}/runs/{run_id}",
    summary="Get the given run for this contest",
    response_model=Dict[str, Any],
)
async def get_run(
    contest_id: str = Path(..., description="Contest identifier"),
    run_id: str = Path(..., description="Run identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_run(contest_id, run_id)
