from __future__ import annotations

from sqlalchemy import delete, func, select, update
from sqlalchemy.orm import Session, selectinload

from app.core.exceptions import LegacyAPIError
from app.infrastructure.db.models import (
    Exercise,
    Lesson,
    MediaAsset,
    PracticeAttempt,
    PracticeSession,
    Sign,
    SignTemplate,
    User,
    UserProgress,
)


DEFAULT_SIGNS = [
    {
        "nombre": "Hola",
        "categoria": "Saludos",
        "dificultad": "FACIL",
        "video_referencia_url": "",
        "gesture_type": "DYNAMIC",
    },
    {
        "nombre": "Adios",
        "categoria": "Saludos",
        "dificultad": "FACIL",
        "video_referencia_url": "",
        "gesture_type": "DYNAMIC",
    },
    {
        "nombre": "Gracias",
        "categoria": "Cortesia",
        "dificultad": "FACIL",
        "video_referencia_url": "",
        "gesture_type": "STATIC",
    },
    {
        "nombre": "Bienvenido",
        "categoria": "Presentacion",
        "dificultad": "MEDIO",
        "video_referencia_url": "",
        "gesture_type": "STATIC",
    },
    {
        "nombre": "Si",
        "categoria": "Respuestas",
        "dificultad": "FACIL",
        "video_referencia_url": "",
        "gesture_type": "STATIC",
    },
    {
        "nombre": "No",
        "categoria": "Respuestas",
        "dificultad": "FACIL",
        "video_referencia_url": "",
        "gesture_type": "STATIC",
    },
]


class ContentService:
    def __init__(self, db: Session):
        self.db = db

    def list_signs(self) -> list[Sign]:
        return list(self.db.scalars(select(Sign).order_by(Sign.id)))

    def get_sign(self, sign_id: int) -> Sign:
        sign = self.db.get(Sign, sign_id)
        if not sign:
            raise LegacyAPIError(404, "Seña no encontrada")
        return sign

    def create_sign(self, payload) -> Sign:
        sign = Sign(
            nombre=payload.nombre.strip(),
            categoria=payload.categoria.strip(),
            dificultad=payload.dificultad.strip().upper(),
            video_referencia_url=payload.video_referencia_url.strip(),
            gesture_type="DYNAMIC" if payload.nombre.lower() in {"hola", "adios"} else "STATIC",
        )
        self.db.add(sign)
        self.db.commit()
        self.db.refresh(sign)
        self._ensure_default_lessons()
        self._attach_sign_to_first_lesson(sign)
        return sign

    def update_sign(self, sign_id: int, payload) -> Sign:
        sign = self.get_sign(sign_id)
        sign.nombre = payload.nombre.strip()
        sign.categoria = payload.categoria.strip()
        sign.dificultad = payload.dificultad.strip().upper()
        sign.video_referencia_url = payload.video_referencia_url.strip()
        self.db.commit()
        self.db.refresh(sign)
        return sign

    def delete_sign(self, sign_id: int) -> None:
        sign = self.db.get(Sign, sign_id)
        if not sign:
            raise LegacyAPIError(404, "Seña no encontrada")
        self.db.execute(delete(PracticeAttempt).where(PracticeAttempt.sena_id == sign_id))
        self.db.execute(
            update(PracticeSession).where(PracticeSession.sena_id == sign_id).values(sena_id=None)
        )
        self.db.execute(delete(UserProgress).where(UserProgress.sena_id == sign_id))
        self.db.execute(delete(MediaAsset).where(MediaAsset.sena_id == sign_id))
        self.db.execute(delete(SignTemplate).where(SignTemplate.sign_id == sign_id))
        self.db.execute(delete(Exercise).where(Exercise.sign_id == sign_id))
        self.db.delete(sign)
        self.db.commit()

    def list_lessons(self) -> list[Lesson]:
        return list(self.db.scalars(select(Lesson).order_by(Lesson.orden, Lesson.id)))

    def list_lesson_exercises(self, lesson_id: int) -> list[Exercise]:
        lesson = self.db.scalar(
            select(Lesson)
            .options(selectinload(Lesson.exercises).selectinload(Exercise.sign))
            .where(Lesson.id == lesson_id)
        )
        if not lesson:
            raise LegacyAPIError(404, "Lección no encontrada")
        return sorted(lesson.exercises, key=lambda exercise: exercise.orden)

    def ensure_seed_data(self, admin_email: str, admin_name: str, admin_password_hash: str) -> None:
        if not self.db.scalar(select(User).where(User.email == admin_email)):
            self.db.add(
                User(
                    nombre=admin_name,
                    email=admin_email,
                    password_hash=admin_password_hash,
                    rol="ADMIN",
                )
            )
            self.db.commit()

        sign_count = self.db.scalar(select(func.count(Sign.id))) or 0
        if sign_count == 0:
            for sign_data in DEFAULT_SIGNS:
                self.db.add(Sign(**sign_data))
            self.db.commit()

        self._ensure_default_lessons()

    def _ensure_default_lessons(self) -> None:
        if self.db.scalar(select(func.count(Lesson.id))) or 0:
            return

        signs = list(self.db.scalars(select(Sign).order_by(Sign.id)))
        if not signs:
            return

        lesson = Lesson(
            titulo="Saludos y presentaciones basicas",
            descripcion="Practica secuencias introductorias con apoyo en tiempo real.",
            categoria="Introduccion",
            dificultad="FACIL",
            orden=1,
        )
        self.db.add(lesson)
        self.db.flush()

        for index, sign in enumerate(signs, start=1):
            self.db.add(
                Exercise(
                    lesson_id=lesson.id,
                    sign_id=sign.id,
                    orden=index,
                    tipo=sign.gesture_type,
                    threshold_success=0.82,
                    threshold_warning=0.48,
                    hold_ms=700 if sign.gesture_type == "STATIC" else 400,
                    hints_json={
                        "title": sign.nombre,
                        "tip": "Mantén la mano dentro del cuadro y repite el movimiento con calma.",
                    },
                )
            )
        self.db.commit()

    def _attach_sign_to_first_lesson(self, sign: Sign) -> None:
        lesson = self.db.scalar(select(Lesson).order_by(Lesson.orden, Lesson.id))
        if not lesson:
            return
        existing = self.db.scalar(
            select(Exercise).where(Exercise.lesson_id == lesson.id, Exercise.sign_id == sign.id)
        )
        if existing:
            return
        max_order = self.db.scalar(select(func.max(Exercise.orden)).where(Exercise.lesson_id == lesson.id)) or 0
        self.db.add(
            Exercise(
                lesson_id=lesson.id,
                sign_id=sign.id,
                orden=max_order + 1,
                tipo=sign.gesture_type,
                threshold_success=0.82,
                threshold_warning=0.48,
                hold_ms=700 if sign.gesture_type == "STATIC" else 400,
                hints_json={"title": sign.nombre, "tip": "Repite el gesto con calma y mantén la mano visible."},
            )
        )
        self.db.commit()
