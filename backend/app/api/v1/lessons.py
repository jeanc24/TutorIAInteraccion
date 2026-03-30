from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.modules.content.schemas import ExerciseOut, LessonOut, SignOut
from app.modules.content.service import ContentService


router = APIRouter(prefix="/api", tags=["lessons"])


@router.get("/lecciones", response_model=list[LessonOut])
def list_lessons(db: Session = Depends(get_db)) -> list[dict]:
    lessons = ContentService(db).list_lessons()
    return [
        {
            "id": lesson.id,
            "titulo": lesson.titulo,
            "descripcion": lesson.descripcion,
            "categoria": lesson.categoria,
            "dificultad": lesson.dificultad,
            "orden": lesson.orden,
        }
        for lesson in lessons
    ]


@router.get("/lecciones/{lesson_id}/ejercicios", response_model=list[ExerciseOut])
def list_lesson_exercises(lesson_id: int, db: Session = Depends(get_db)) -> list[dict]:
    exercises = ContentService(db).list_lesson_exercises(lesson_id)
    return [
        {
            "id": exercise.id,
            "orden": exercise.orden,
            "tipo": exercise.tipo,
            "threshold_success": exercise.threshold_success,
            "threshold_warning": exercise.threshold_warning,
            "hold_ms": exercise.hold_ms,
            "sena": SignOut.model_validate(exercise.sign).model_dump(by_alias=True),
        }
        for exercise in exercises
    ]
