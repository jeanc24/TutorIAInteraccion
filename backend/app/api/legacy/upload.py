from __future__ import annotations

import shutil
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile

from app.api.deps import get_current_admin
from app.core.config import get_settings


router = APIRouter(prefix="/api/upload", tags=["legacy-upload"])


@router.post("", dependencies=[Depends(get_current_admin)])
def upload_video(file: UploadFile = File(...)) -> dict[str, str]:
    settings = get_settings()
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    safe_name = file.filename or "video.mp4"
    safe_name = "".join(character if character.isalnum() or character in "._-" else "_" for character in safe_name)
    final_name = f"{uuid4()}_{safe_name}"
    destination = Path(settings.upload_dir) / final_name
    with destination.open("wb") as target_file:
        shutil.copyfileobj(file.file, target_file)
    return {"url": f"/videos/{final_name}"}
