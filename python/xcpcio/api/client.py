from typing import Any, Dict, Optional

import aiohttp

from .models import FileData, UploadBoardDataReq, UploadBoardDataResp


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
