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
    "/contests/{contest_id}/organizations",
    summary="Get all the organizations for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_organizations(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_organizations(contest_id)


@router.get(
    "/contests/{contest_id}/organizations/{organization_id}",
    summary="Get the given organization for this contest",
    response_model=Dict[str, Any],
)
async def get_organization(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    organization_id: str = FastAPIPath(..., description="Organization identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_organization(contest_id, organization_id)


@router.get(
    "/contests/{contest_id}/organizations/{organization_id}/logo",
    summary="Get Organization Logo",
    response_class=FileResponse,
)
async def get_organization_logo(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    organization_id: str = FastAPIPath(..., description="Organization identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    service.validate_contest_id(contest_id)

    org = service.organizations_by_id.get(organization_id)
    if not org:
        raise HTTPException(status_code=404, detail=f"Organization {organization_id} not found")

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
