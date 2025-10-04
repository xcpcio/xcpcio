import logging
from typing import Any, Dict, List

from fastapi import APIRouter
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/teams",
    summary="Get all the teams for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_teams(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_teams(contest_id)


@router.get(
    "/contests/{contest_id}/teams/{team_id}",
    summary="Get the given team for this contest",
    response_model=Dict[str, Any],
)
async def get_team(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    team_id: str = FastAPIPath(..., description="Team identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_team(contest_id, team_id)


@router.get(
    "/contests/{contest_id}/teams/{team_id}/photo",
    summary="Get Team Photo",
    response_class=FileResponse,
)
async def get_team_photo(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    team_id: str = FastAPIPath(..., description="Team identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    file_attr = service.get_team_photo(contest_id, team_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)
