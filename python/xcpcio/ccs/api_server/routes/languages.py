import logging
from typing import Any, Dict, List

from fastapi import APIRouter, Path

from ...model import (
    Language,
    Languages,
)
from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/languages",
    summary="Get Languages",
    description="Get all programming languages available for submission",
    response_model=Languages,
)
async def get_languages(
    contest_id: str = Path(..., description="Contest identifier"), service: ContestServiceDep = None
) -> List[Dict[str, Any]]:
    """Get all programming languages"""
    return service.get_languages(contest_id)


@router.get(
    "/contests/{contest_id}/languages/{language_id}",
    summary="Get Language",
    description="Get specific language information",
    response_model=Language,
)
async def get_language(
    contest_id: str = Path(..., description="Contest identifier"),
    language_id: str = Path(..., description="Language identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    """Get specific language information"""
    return service.get_language(contest_id, language_id)
