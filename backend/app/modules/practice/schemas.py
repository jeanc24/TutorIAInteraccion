from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class PracticeSessionCreate(BaseModel):
    usuario_id: int | None = None
    leccion_id: int | None = None
    sena_id: int | None = None


class PracticeSessionOut(BaseModel):
    id: str
    usuario_id: int | None
    leccion_id: int | None
    sena_id: int | None
    estado: str
    objetivo_actual: str | None
    started_at: datetime


class PracticeSessionStatusOut(BaseModel):
    id: str
    estado: str
    score_actual: float | None
    paso_actual: int | None
    feedback: str | None
    resumen: dict | None
