from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.modules.progress.schemas import UserProgressSummaryOut
from app.modules.progress.service import ProgressService
from app.modules.vision.schemas import TutorConfigOut


router = APIRouter(prefix="/api", tags=["tutor"])


@router.get("/progreso/usuario/{user_id}", response_model=UserProgressSummaryOut)
def get_user_progress(user_id: int, db: Session = Depends(get_db)) -> UserProgressSummaryOut:
    return ProgressService(db).get_user_progress(user_id)


@router.get("/tutor/config", response_model=TutorConfigOut)
def get_tutor_config() -> TutorConfigOut:
    return TutorConfigOut(
        vision_mode="local_backend",
        fps_objetivo=15,
        feedback_policy="instant_visual_and_text",
    )
