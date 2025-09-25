import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ...model import Contest, State
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/contests", summary="Get Contests", description="Get list of all contests", response_model=List[Contest])
async def get_contests(service: ContestServiceDep) -> List[Dict[str, Any]]:
    """Get all contests"""
    return service.get_contests()


@router.get(
    "/contests/{contest_id}",
    summary="Get Contest",
    description="Get specific contest information",
    response_model=Contest,
)
async def get_contest(
    contest_id: str = FastAPIPath(..., description="Contest identifier"), service: ContestServiceDep = None
) -> Dict[str, Any]:
    """Get specific contest information"""
    return service.get_contest(contest_id)


@router.get(
    "/contests/{contest_id}/state",
    summary="Get Contest State",
    description="Get current contest state (started, ended, frozen, etc.)",
    response_model=State,
)
async def get_state(
    contest_id: str = FastAPIPath(..., description="Contest identifier"), service: ContestServiceDep = None
) -> Dict[str, Any]:
    """Get contest state"""
    return service.get_contest_state(contest_id)


@router.get(
    "/contests/{contest_id}/contest/banner",
    summary="Get Contest Banner",
    description="Get banner image for the contest",
    response_class=FileResponse,
)
async def get_contest_banner(
    contest_id: str = FastAPIPath(..., description="Contest identifier"), service: ContestServiceDep = None
) -> FileResponse:
    """Get contest banner file"""
    service.validate_contest_id(contest_id)

    # Expected href pattern for this endpoint
    expected_href = f"contests/{contest_id}/contest/banner"

    try:
        banners = service.contest_data.get("banner", [])
        for banner in banners:
            href = banner["href"]
            if href == expected_href:
                filename = banner["filename"]
                banner_file: Path = service.contest_package_dir / "contest" / filename
                if banner_file.exists():
                    mime_type = banner["mime"]
                    return FileResponse(path=banner_file, media_type=mime_type, filename=filename)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Banner not found. [contest_id={contest_id}] [err={e}]")
