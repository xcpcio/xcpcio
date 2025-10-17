import logging
from typing import Any, Dict, List

from fastapi import APIRouter
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/problems",
    summary="Get all the problems for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_problems(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_problems(contest_id)


@router.get(
    "/contests/{contest_id}/problems/{problem_id}",
    summary="Get the given problem for this contest",
    response_model=Dict[str, Any],
)
async def get_problem(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    problem_id: str = FastAPIPath(..., description="Problem identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_problem(contest_id, problem_id)


@router.get(
    "/contests/{contest_id}/problems/{problem_id}/statement",
    summary="Get Problem Statement",
    response_class=FileResponse,
)
async def get_problem_statement(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    problem_id: str = FastAPIPath(..., description="Problem identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    file_attr = service.get_problem_statement(contest_id, problem_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)
