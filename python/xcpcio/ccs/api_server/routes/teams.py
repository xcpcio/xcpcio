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
    service.validate_contest_id(contest_id)

    team = service.teams_by_id.get(team_id)
    if not team:
        raise HTTPException(status_code=404, detail=f"Team {team_id} not found")

    expected_href = f"contests/{contest_id}/teams/{team_id}/photo"

    try:
        photos = team["photo"]
        for photo in photos:
            href = photo["href"]
            if href == expected_href:
                filename = photo["filename"]
                photo_file: Path = service.contest_package_dir / "teams" / team_id / filename
                if photo_file.exists():
                    mime_type = photo["mime"]
                    return FileResponse(path=photo_file, media_type=mime_type, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Photo not found. [team_id={team_id}] [err={e}]")
