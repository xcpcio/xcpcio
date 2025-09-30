import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/languages",
    summary="Get all the languages for this contest",
    response_model=List[Dict[str, Any]],
)
async def get_languages(
    contest_id: str = Path(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_languages(contest_id)


@router.get(
    "/contests/{contest_id}/languages/{language_id}",
    summary="Get the given language for this contest",
    response_model=Dict[str, Any],
)
async def get_language(
    contest_id: str = Path(..., description="Contest identifier"),
    language_id: str = Path(..., description="Language identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_language(contest_id, language_id)
