from typing import Dict, List, Optional, Union

from pydantic import BaseModel, Field


class ValidationError(BaseModel):
    loc: List[Union[str, int]] = Field(..., title="Location")
    msg: str = Field(..., title="Message")
    type: str = Field(..., title="Error Type")


class HTTPValidationError(BaseModel):
    detail: Optional[List[ValidationError]] = Field(None, title="Detail")


class UploadBoardDataReq(BaseModel):
    token: str = Field(..., title="Token")
    config: Optional[str] = Field(None, title="Config")
    teams: Optional[str] = Field(None, title="Teams")
    submissions: Optional[str] = Field(None, title="Submissions")
    extra_files: Optional[Dict[str, str]] = Field(None, title="Extra Files")


class UploadBoardDataResp(BaseModel):
    pass
