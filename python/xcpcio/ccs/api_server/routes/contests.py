import json
import logging
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Query
from fastapi import Path as FastAPIPath
from fastapi.responses import FileResponse, StreamingResponse

from ..dependencies import ContestServiceDep

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get(
    "/contests",
    summary="Get all the contests",
    response_model=List[Dict[str, Any]],
)
async def get_contests(service: ContestServiceDep) -> List[Dict[str, Any]]:
    return service.get_contests()


@router.get(
    "/contests/{contest_id}",
    summary="Get the given contest",
    response_model=Dict[str, Any],
)
async def get_contest(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_contest(contest_id)


@router.get(
    "/contests/{contest_id}/state",
    summary="Get the current contest state",
    response_model=Dict[str, Any],
)
async def get_state(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> Dict[str, Any]:
    return service.get_contest_state(contest_id)


@router.get(
    "/contests/{contest_id}/banner",
    summary="Get the banner for the given contest",
    response_class=FileResponse,
)
async def get_contest_banner(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    file_attr = service.get_contest_banner(contest_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)


@router.get(
    "/contests/{contest_id}/problemset",
    summary="Get the problemset document for the given contest",
    response_class=FileResponse,
)
async def get_contest_problem_set(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    service: ContestServiceDep = None,
) -> FileResponse:
    file_attr = service.get_contest_problemset(contest_id)
    return FileResponse(path=file_attr.path, media_type=file_attr.media_type, filename=file_attr.name)


@router.get(
    "/contests/{contest_id}/event-feed",
    summary="Get event feed for contest",
    description="Get events for the contest in NDJSON format. Each line contains a single event object.",
)
async def get_event_feed(
    contest_id: str = FastAPIPath(..., description="Contest identifier"),
    stream: bool = Query(False, description="Whether to stream the output or stop immediately"),
    since_token: Optional[str] = Query(None, description="Return events after this token"),
    service: ContestServiceDep = None,
) -> StreamingResponse:
    async def generate():
        events = service.get_event_feed(contest_id, since_token)
        for event in events:
            yield json.dumps(event, ensure_ascii=False, separators=(",", ":")) + "\n"

    return StreamingResponse(generate(), media_type="application/x-ndjson")
