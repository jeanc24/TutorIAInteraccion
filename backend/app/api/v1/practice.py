from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.modules.practice.schemas import (
    PracticeSessionCreate,
    PracticeSessionOut,
    PracticeSessionStatusOut,
)
from app.modules.practice.service import PracticeService


router = APIRouter(prefix="/api", tags=["practice"])


@router.post("/sesiones-practica", response_model=PracticeSessionOut, status_code=201)
def create_session(payload: PracticeSessionCreate, db: Session = Depends(get_db)) -> dict:
    session = PracticeService(db).create_session(payload.usuario_id, payload.leccion_id, payload.sena_id)
    return {
        "id": session.id,
        "usuario_id": session.usuario_id,
        "leccion_id": session.leccion_id,
        "sena_id": session.sena_id,
        "estado": session.estado,
        "objetivo_actual": session.sign.nombre if session.sign else None,
        "started_at": session.started_at,
    }


@router.get("/sesiones-practica/{session_id}", response_model=PracticeSessionStatusOut)
def get_session_status(session_id: str, db: Session = Depends(get_db)) -> dict:
    session = PracticeService(db).get_session(session_id)
    resumen = session.resumen_json or {}
    return {
        "id": session.id,
        "estado": session.estado,
        "score_actual": resumen.get("score_actual"),
        "paso_actual": resumen.get("paso_actual"),
        "feedback": resumen.get("feedback"),
        "resumen": resumen,
    }


@router.post("/sesiones-practica/{session_id}/finalizar", response_model=PracticeSessionStatusOut)
def finalize_session(session_id: str, db: Session = Depends(get_db)) -> dict:
    session = PracticeService(db).finalize_session(session_id)
    resumen = session.resumen_json or {}
    return {
        "id": session.id,
        "estado": session.estado,
        "score_actual": resumen.get("score_actual"),
        "paso_actual": resumen.get("paso_actual"),
        "feedback": resumen.get("feedback"),
        "resumen": resumen,
    }
