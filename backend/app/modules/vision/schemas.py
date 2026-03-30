from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel


class VisionStartRequest(BaseModel):
    mode: str = "preview"
    session_id: str | None = None
    usuario_id: int | None = None
    sena_id: int | None = None
    target_name: str | None = None


class VisionEvent(BaseModel):
    session_id: str | None = None
    estado: str
    sena_id: int | None = None
    score: float | None = None
    paso_actual: int | None = None
    feedback: str
    landmarks: list[list[float]] | None = None
    timestamp: datetime


class TutorConfigOut(BaseModel):
    vision_mode: str
    fps_objetivo: int
    feedback_policy: str
