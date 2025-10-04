import logging
from typing import Any, Dict, List

from fastapi import APIRouter
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
    file_attr = service.get_organization_logo(contest_id, organization_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)
