from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import LegacyAPIError
from app.infrastructure.db.models import PracticeAttempt, PracticeSession, Sign, User, UserProgress
from app.modules.progress.schemas import UserProgressSummaryOut


class ProgressService:
    def __init__(self, db: Session):
        self.db = db

    def register_attempt(
        self,
        user_id: int,
        sign_id: int,
        score: float,
        *,
        session_id: str | None = None,
        completed: bool | None = None,
        confidence: float | None = None,
        feedback: dict | None = None,
    ) -> UserProgress:
        user = self.db.get(User, user_id)
        if not user:
            raise LegacyAPIError(404, "Usuario no encontrado")
        sign = self.db.get(Sign, sign_id)
        if not sign:
            raise LegacyAPIError(404, "Seña no encontrada")

        progress = self.db.scalar(
            select(UserProgress).where(
                UserProgress.usuario_id == user_id,
                UserProgress.sena_id == sign_id,
            )
        )
        if not progress:
            progress = UserProgress(usuario_id=user_id, sena_id=sign_id, mejor_puntuacion=0.0, intentos=0)
            self.db.add(progress)

        progress.intentos += 1
        progress.mejor_puntuacion = max(progress.mejor_puntuacion, float(score))
        progress.completado = completed if completed is not None else progress.mejor_puntuacion >= 80.0
        progress.fecha_ultimo_intento = datetime.now(UTC)

        if session_id:
            session = self.db.get(PracticeSession, session_id)
            if session:
                self.db.add(
                    PracticeAttempt(
                        session_id=session.id,
                        exercise_id=None,
                        sena_id=sign_id,
                        score=score,
                        confidence=confidence,
                        completed=progress.completado,
                        feedback_json=feedback,
                    )
                )

        self.db.commit()
        self.db.refresh(progress)
        return progress

    def get_user_progress(self, user_id: int) -> UserProgressSummaryOut:
        user = self.db.get(User, user_id)
        if not user:
            raise LegacyAPIError(404, "Usuario no encontrado")

        items = list(
            self.db.scalars(
                select(UserProgress)
                .options(selectinload(UserProgress.sign))
                .where(UserProgress.usuario_id == user_id)
                .order_by(UserProgress.sena_id)
            )
        )
        completadas = sum(1 for item in items if item.completado)
        promedio = round(sum(item.mejor_puntuacion for item in items) / len(items), 2) if items else 0.0
        return UserProgressSummaryOut(
            usuario_id=user_id,
            total_senas=len(items),
            completadas=completadas,
            promedio=promedio,
            items=[
                {
                    "sign": item.sign,
                    "mejorPuntuacion": item.mejor_puntuacion,
                    "completado": item.completado,
                    "intentos": item.intentos,
                    "fechaUltimoIntento": item.fecha_ultimo_intento,
                }
                for item in items
            ],
        )
