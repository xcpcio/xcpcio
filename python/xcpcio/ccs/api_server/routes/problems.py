import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ...model import Problem, Problems
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/problems",
    summary="Get Problems",
    description="Get all problems in the contest",
    response_model=Problems,
)
async def get_problems(
    contest_id: str = FastAPIPath(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all problems in the contest"""
    return service.get_problems(contest_id)


@router.get(
    "/contests/{contest_id}/problems/{problem_id}",
    summary="Get Problem",
    description="Get specific problem information",
    response_model=Problem,
)
async def get_problem(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    problem_id: str = FastAPIPath(..., description="Problem identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific problem information"""
    return service.get_problem(contest_id, problem_id)


@router.get(
    "/contests/{contest_id}/problems/{problem_id}/statement",
    summary="Get Problem Statement",
    description="Get problem statement file",
    response_class=FileResponse,
)
async def get_problem_statement(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    problem_id: str = FastAPIPath(..., description="Problem identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    """Get problem statement file"""
    service.validate_contest_id(contest_id)

    # Get problem from indexed data
    problem: Dict = service.problems_by_id.get(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem {problem_id} not found")

    # Expected href pattern for this endpoint
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
