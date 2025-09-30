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
    "/contests/{contest_id}/submissions",
    summary="Get all the submissions for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_submissions(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_submissions(contest_id)


@router.get(
    "/contests/{contest_id}/submissions/{submission_id}",
    summary="Get the given submission for this contest",
    response_model=Dict[str, Any],
)
async def get_submission(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    submission_id: str = FastAPIPath(..., description="Submission identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_submission(contest_id, submission_id)


@router.get(
    "/contests/{contest_id}/submissions/{submission_id}/files",
    summary="Get Submission Files",
    response_class=FileResponse,
)
async def get_submission_files(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    submission_id: str = FastAPIPath(..., description="Submission identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    service.validate_contest_id(contest_id)

    submission = service.submissions_by_id.get(submission_id)
    if not submission:
        raise HTTPException(status_code=404, detail=f"Submission {submission_id} not found")

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
