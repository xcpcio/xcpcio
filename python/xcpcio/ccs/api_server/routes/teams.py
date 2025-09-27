import logging
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, HTTPException, Query
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/teams",
    summary="Get Teams",
    description="Get all teams, optionally filtered by group",
    response_model=List[Dict[str, Any]],
)
async def get_teams(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    group_id: Optional[str] = Query(None, description="Filter teams by group ID"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    """Get all teams, optionally filtered by group"""
    return service.get_teams(contest_id, group_id)


@router.get(
    "/contests/{contest_id}/teams/{team_id}",
    summary="Get Team",
    description="Get specific team information",
    response_model=Dict[str, Any],
)
async def get_team(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    team_id: str = FastAPIPath(..., description="Team identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific team information"""
    return service.get_team(contest_id, team_id)


@router.get(
    "/contests/{contest_id}/teams/{team_id}/photo",
    summary="Get Team Photo",
    description="Get photo file for a specific team",
    response_class=FileResponse,
)
async def get_team_photo(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    team_id: str = FastAPIPath(..., description="Team identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    """Get team photo file"""
    service.validate_contest_id(contest_id)

    # Get team from indexed data
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
