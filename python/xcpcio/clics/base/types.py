from dataclasses import dataclass
from pathlib import Path
from typing import Optional


@dataclass
class FileAttr:
    path: Path
    media_type: str
    name: str


@dataclass
class Image:
    base64: str

    mime_type: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
