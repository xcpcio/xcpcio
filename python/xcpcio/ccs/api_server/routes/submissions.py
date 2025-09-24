import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ...model import Submission, Submissions
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/submissions",
    summary="Get Submissions",
    description="Get all submissions, optionally filtered by team or problem",
    response_model=Submissions,
)
async def get_submissions(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    team_id: Optional[str] = Query(None, description="Filter submissions by team ID"),
    problem_id: Optional[str] = Query(None, description="Filter submissions by problem ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    """Get all submissions, optionally filtered by team or problem"""
    return service.get_submissions(contest_id, team_id, problem_id)


@router.get(
    "/contests/{contest_id}/submissions/{submission_id}",
    summary="Get Submission",
    description="Get specific submission information",
    response_model=Submission,
)
async def get_submission(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    submission_id: str = FastAPIPath(..., description="Submission identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific submission information"""
    return service.get_submission(contest_id, submission_id)


@router.get(
    "/contests/{contest_id}/submissions/{submission_id}/files",
    summary="Get Submission Files",
    description="Get files for a specific submission",
    response_class=FileResponse,
)
async def get_submission_files(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    submission_id: str = FastAPIPath(..., description="Submission identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    """Get submission files"""
    service.validate_contest_id(contest_id)

    # Get submission from indexed data
    submission = service.submissions_by_id.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")

    # Expected href pattern for this endpoint
    expected_href = f"contests/{contest_id}/submissions/{submission_id}/files"

    try:
        files: List[Dict] = submission["files"]
        for file_info in files:
            href = file_info["href"]
            if href == expected_href:
                filename = file_info["filename"]
                submission_file: Path = service.contest_package_dir / "submissions" / submission_id / filename
                if submission_file.exists():
                    mime_type = file_info["mime"]
                    return FileResponse(path=submission_file, media_type=mime_type, filename=filename)
    except Exception as e:
        raise HTTPException(
            status_code=404, detail=f"Submission files not found. [submission_id={submission_id}] [err={e}]"
        )
