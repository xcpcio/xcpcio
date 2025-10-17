import logging
from typing import Any, Dict, List

from fastapi import APIRouter
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
    file_attr = service.get_submission_file(contest_id, submission_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)
