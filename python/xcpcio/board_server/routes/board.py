"""
Board Data API Routes

FastAPI routes for serving contest data in XCPCIO Board format.
"""

import logging

from fastapi import APIRouter, HTTPException, Path, Request
from fastapi.responses import JSONResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/data")


def get_data_cache(request: Request):
    """Get the data cache from app state."""
    return request.app.state.data_cache


@router.get("/{contest_path:path}/config.json")
async def get_config(
    request: Request,
    contest_path: str = Path(..., description="Contest path"),
) -> JSONResponse:
    """
    Get contest configuration.

    Returns the contest configuration in XCPCIO Board format.
    """
    # Remove trailing slash if present
    contest_path = contest_path.rstrip("/")

    cache = get_data_cache(request)
    try:
        config = cache.get_config(contest_path)
        return JSONResponse(content=config)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Contest not found: {contest_path}")


@router.get("/{contest_path:path}/team.json")
async def get_teams(
    request: Request,
    contest_path: str = Path(..., description="Contest path"),
) -> JSONResponse:
    """
    Get teams data.

    Returns the teams data as a dictionary mapping team_id to team info.
    """
    # Remove trailing slash if present
    contest_path = contest_path.rstrip("/")

    cache = get_data_cache(request)
    try:
        teams = cache.get_teams(contest_path)
        return JSONResponse(content=teams)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Contest not found: {contest_path}")


@router.get("/{contest_path:path}/run.json")
async def get_runs(
    request: Request,
    contest_path: str = Path(..., description="Contest path"),
) -> JSONResponse:
    """
    Get submissions/runs data.

    Returns the submissions data as an array.
    """
    # Remove trailing slash if present
    contest_path = contest_path.rstrip("/")

    cache = get_data_cache(request)
    try:
        runs = cache.get_submissions(contest_path)
        return JSONResponse(content=runs)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Contest not found: {contest_path}")


@router.get("/{contest_path:path}/organization.json")
async def get_organizations(
    request: Request,
    contest_path: str = Path(..., description="Contest path"),
) -> JSONResponse:
    """
    Get organizations data.

    Returns the organizations data as an array.
    """
    # Remove trailing slash if present
    contest_path = contest_path.rstrip("/")

    cache = get_data_cache(request)
    try:
        organizations = cache.get_organizations(contest_path)
        return JSONResponse(content=organizations)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Contest not found: {contest_path}")


@router.get("/{contest_path:path}")
async def get_board_data(
    request: Request,
    contest_path: str = Path(..., description="Contest path"),
) -> JSONResponse:
    """
    Get combined board data (allInOne mode).

    Returns a combined object containing contest, teams, and submissions.
    This endpoint is used when the frontend requests data in allInOne mode.
    """
    # Skip paths that look like they're requesting specific files
    if contest_path.endswith(".json"):
        raise HTTPException(status_code=404, detail="Not found")

    # Remove trailing slash if present
    contest_path = contest_path.rstrip("/")

    cache = get_data_cache(request)
    try:
        board_data = cache.get_board_data(contest_path)
        return JSONResponse(content=board_data)
    except KeyError:
        raise HTTPException(status_code=404, detail=f"Contest not found: {contest_path}")
