from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.infrastructure.db.models import UserProgress
from app.infrastructure.db.session import get_db
from app.modules.progress.schemas import LegacyProgressOut, LegacyProgressRequest
from app.modules.progress.service import ProgressService


router = APIRouter(prefix="/api/progreso", tags=["legacy-progress"])


@router.post("/registrar", response_model=LegacyProgressOut)
def register_progress(
    payload: LegacyProgressRequest,
    db: Session = Depends(get_db),
    _current_user=Depends(get_current_user),
) -> UserProgress:
    return ProgressService(db).register_attempt(payload.usuario_id, payload.sena_id, payload.puntuacion)
