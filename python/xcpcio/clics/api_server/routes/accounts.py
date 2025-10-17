import logging
from typing import Any, Dict, List

from fastapi import APIRouter
from fastapi import Path as FastAPIPath

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests/{contest_id}/accounts",
    summary="Get all the accounts",
    response_model=List[Dict[str, Any]],
)
async def get_accounts(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> List[Dict[str, Any]]:
    return service.get_accounts(contest_id)


@router.get(
    "/contests/{contest_id}/accounts/{account_id}",
    summary="Get the given account",
    response_model=Dict[str, Any],
)
async def get_account(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    account_id: str = FastAPIPath(..., description="Account identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_account(contest_id, account_id)
