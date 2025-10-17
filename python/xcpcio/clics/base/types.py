from dataclasses import dataclass
from pathlib import Path


@dataclass
class FileAttr:
    path: Path
    media_type: str
    name: str
