from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import LegacyAPIError
from app.infrastructure.db.models import Lesson, PracticeAttempt, PracticeSession, Sign, User


class PracticeService:
    def __init__(self, db: Session):
        self.db = db

    def create_session(self, user_id: int | None, lesson_id: int | None, sign_id: int | None) -> PracticeSession:
        if user_id and not self.db.get(User, user_id):
            raise LegacyAPIError(404, "Usuario no encontrado")
        lesson = self.db.get(Lesson, lesson_id) if lesson_id else None
        sign = self.db.get(Sign, sign_id) if sign_id else None
        if lesson_id and not lesson:
            raise LegacyAPIError(404, "Lección no encontrada")
        if sign_id and not sign:
            raise LegacyAPIError(404, "Seña no encontrada")

        session = PracticeSession(
            usuario_id=user_id,
            leccion_id=lesson_id,
            sena_id=sign_id,
            estado="pending",
            resumen_json={
                "score_actual": None,
                "paso_actual": 1,
                "feedback": "Listo para iniciar",
            },
        )
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def get_session(self, session_id: str) -> PracticeSession:
        session = self.db.scalar(
            select(PracticeSession)
            .options(selectinload(PracticeSession.attempts))
            .where(PracticeSession.id == session_id)
        )
        if not session:
            raise LegacyAPIError(404, "Sesión no encontrada")
        return session

    def mark_running(self, session_id: str, score: float | None = None, feedback: str | None = None) -> PracticeSession:
        session = self.get_session(session_id)
        session.estado = "running"
        if session.resumen_json is None:
            session.resumen_json = {}
        if score is not None:
            session.resumen_json["score_actual"] = score
        if feedback is not None:
            session.resumen_json["feedback"] = feedback
        self.db.commit()
        self.db.refresh(session)
        return session

    def finalize_session(self, session_id: str) -> PracticeSession:
        session = self.get_session(session_id)
        session.estado = "completed"
        session.ended_at = datetime.now(UTC)
        attempts = list(
            self.db.scalars(select(PracticeAttempt).where(PracticeAttempt.session_id == session_id))
        )
        session.resumen_json = {
            "score_actual": max((attempt.score for attempt in attempts), default=None),
            "paso_actual": len(attempts),
            "feedback": "Sesión finalizada",
            "intentos": len(attempts),
        }
        self.db.commit()
        self.db.refresh(session)
        return session
