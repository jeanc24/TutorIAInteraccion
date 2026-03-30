from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class SignRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    nombre: str = Field(min_length=1)
    categoria: str = Field(min_length=1)
    dificultad: str = Field(min_length=1)
    video_referencia_url: str = Field(alias="videoReferenciaUrl", min_length=1)


class SignOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    nombre: str
    categoria: str
    dificultad: str
    video_referencia_url: str = Field(alias="videoReferenciaUrl")


class LessonOut(BaseModel):
    id: int
    titulo: str
    descripcion: str | None
    categoria: str
    dificultad: str
    orden: int


class ExerciseOut(BaseModel):
    id: int
    orden: int
    tipo: str
    threshold_success: float
    threshold_warning: float
    hold_ms: int
    sena: SignOut
