import logging
from pathlib import Path
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse

from ...model import (
    Organization,
    Organizations,
)
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/organizations",
    summary="Get Organizations",
    description="Get all organizations in the contest",
    response_model=Organizations,
)
async def get_organizations(
    contest_id: str = FastAPIPath(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all organizations"""
    return service.get_organizations(contest_id)


@router.get(
    "/contests/{contest_id}/organizations/{organization_id}",
    summary="Get Organization",
    description="Get specific organization information",
    response_model=Organization,
)
async def get_organization(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    organization_id: str = FastAPIPath(..., description="Organization identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific organization information"""
    return service.get_organization(contest_id, organization_id)


@router.get(
    "/contests/{contest_id}/organizations/{organization_id}/logo",
    summary="Get Organization Logo",
    description="Get logo file for a specific organization",
    response_class=FileResponse,
)
async def get_organization_logo(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    organization_id: str = FastAPIPath(..., description="Organization identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    """Get organization logo file"""
    service.validate_contest_id(contest_id)

    # Get organization from indexed data
    org = service.organizations_by_id.get(organization_id)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")

    # Expected href pattern for this endpoint
    expected_href = f"contests/{contest_id}/organizations/{organization_id}/logo"

    try:
        logos = org["logo"]
        for logo in logos:
            href = logo["href"]
            if href == expected_href:
                filename = logo["filename"]
                logo_file: Path = service.contest_package_dir / "organizations" / organization_id / filename
                if logo_file.exists():
                    mime_type = logo["mime"]
                    return FileResponse(path=logo_file, media_type=mime_type, filename=filename)
    except Exception as e:
        raise HTTPException(
            status_code=404, detail=f"Logo file not found. [organization_id={organization_id}] [err={e}]"
        )
