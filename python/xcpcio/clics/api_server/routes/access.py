import logging
from typing import Any, Dict

from fastapi import APIRouter

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/access",
    summary="Get access information",
    response_model=Dict[str, Any],
)
async def get_access(contest_id: str, service: ContestServiceDep) -> Dict[str, Any]:
    return service.get_access(contest_id)
