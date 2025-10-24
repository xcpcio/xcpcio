from typing import Dict, List, Literal, Optional, Union

from pydantic import BaseModel, Field


class ValidationError(BaseModel):
    loc: List[Union[str, int]] = Field(..., title="Location")
    msg: str = Field(..., title="Message")
    type: str = Field(..., title="Error Type")


class HTTPValidationError(BaseModel):
    detail: Optional[List[ValidationError]] = Field(None, title="Detail")


class FileData(BaseModel):
    content: str = Field(..., title="Content")
    encoding: Optional[Literal["base64"]] = Field(None, title="Encoding")
    checksum: Optional[str] = Field(None, title="Checksum")


class UploadBoardDataReq(BaseModel):
    token: str = Field(..., title="Token")
    config: Optional[str] = Field(None, title="Config")
    teams: Optional[str] = Field(None, title="Teams")
    submissions: Optional[str] = Field(None, title="Submissions")
    extra_files: Optional[Dict[str, FileData]] = Field(None, title="Extra Files")


class FileValidationResult(BaseModel):
    checksum_valid: bool = Field(..., title="Checksum Valid")
    message: Optional[str] = Field(None, title="Message")


class UploadBoardDataResp(BaseModel):
    file_validations: Dict[str, FileValidationResult] = Field(default_factory=dict, title="File Validations")
