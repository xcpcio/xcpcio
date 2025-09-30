import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
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
    service.validate_contest_id(contest_id)

    problem: Dict = service.problems_by_id.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")

    expected_href = f"contests/{contest_id}/problems/{problem_id}/statement"

    try:
        statements = problem.get("statement", [])
        for statement in statements:
            href = statement["href"]
            filename = statement["filename"]
            if href == expected_href and filename:
                statement_file: Path = service.contest_package_dir / "problems" / problem_id / filename
                if statement_file.exists():
                    mime_type = statement["mime"]
                    return FileResponse(path=statement_file, media_type=mime_type, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Statement not found. [problem_id={problem_id}] [err={e}]")
