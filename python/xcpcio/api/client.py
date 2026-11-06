import asyncio
import logging
from typing import Any, Dict, Optional

import aiohttp

from .models import FileData, FileValidationResult, UploadBoardDataReq, UploadBoardDataResp

logger = logging.getLogger(__name__)


class ApiClient:
    def __init__(
        self,
        base_url: str = "https://board-admin.xcpcio.com",
        token: Optional[str] = None,
        timeout: int = 10,
    ):
        self._base_url = base_url.rstrip("/")
        self._token = token
        self._timeout = aiohttp.ClientTimeout(total=timeout)
        self._session: Optional[aiohttp.ClientSession] = None

    async def __aenter__(self):
        self._session = aiohttp.ClientSession(timeout=self._timeout)
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self._session:
            await self._session.close()

    async def _ensure_session(self):
        if self._session is None:
            self._session = aiohttp.ClientSession(timeout=self._timeout)

    async def _ensure_token(self):
        if self._token is None:
            raise ValueError(
                "Token is required for this operation. Please provide a token when initializing the client."
            )

    async def close(self):
        if self._session:
            await self._session.close()
            self._session = None

    async def ping(self) -> Dict[str, Any]:
        await self._ensure_session()
        async with self._session.get(f"{self._base_url}/api/ping") as response:
            response.raise_for_status()
            return await response.json()

    async def upload_board_data(
        self,
        config: Optional[str] = None,
        teams: Optional[str] = None,
        submissions: Optional[str] = None,
        extra_files: Optional[Dict[str, FileData]] = None,
    ) -> UploadBoardDataResp:
        await self._ensure_session()
        await self._ensure_token()

        request_data = UploadBoardDataReq(
            token=self._token,
            config=config,
            teams=teams,
            submissions=submissions,
            extra_files=extra_files,
        )

        async with self._session.post(
            f"{self._base_url}/api/upload-board-data",
            json=request_data.model_dump(exclude_none=True),
            headers={"Content-Type": "application/json"},
        ) as response:
            response.raise_for_status()
            data = await response.json()
            return UploadBoardDataResp(**data)

    async def upload_board_file(
        self,
        path: str,
        content: bytes,
        checksum: Optional[str] = None,
        max_retries: int = 3,
    ) -> FileValidationResult:
        await self._ensure_session()
        await self._ensure_token()

        filename = path.rsplit("/", 1)[-1]

        for attempt in range(max_retries + 1):
            form = aiohttp.FormData()
            form.add_field("token", self._token)
            form.add_field("path", path)
            if checksum:
                form.add_field("checksum", checksum)
            form.add_field("file", content, filename=filename, content_type="application/octet-stream")

            async with self._session.post(f"{self._base_url}/api/upload-board-file", data=form) as response:
                if response.status == 429 and attempt < max_retries:
                    try:
                        delay = float(response.headers.get("Retry-After", "1"))
                    except ValueError:
                        delay = 1.0

                    logger.warning(f"Upload file rate limited, retrying in {delay}s. [path={path}]")
                    await asyncio.sleep(delay)
                    continue

                response.raise_for_status()
                data = await response.json()
                return FileValidationResult(**data)
