from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.modules.content.schemas import SignOut


class LegacyProgressRequest(BaseModel):
    usuario_id: int
    sena_id: int
    puntuacion: float


class LegacyProgressOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: int
    usuario_id: int
    sena_id: int
    mejor_puntuacion: float = Field(alias="mejorPuntuacion")
    completado: bool
    intentos: int
    fecha_ultimo_intento: datetime = Field(alias="fechaUltimoIntento")


class ProgressItemOut(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    sign: SignOut
    mejor_puntuacion: float = Field(alias="mejorPuntuacion")
    completado: bool
    intentos: int
    fecha_ultimo_intento: datetime = Field(alias="fechaUltimoIntento")


class UserProgressSummaryOut(BaseModel):
    usuario_id: int
    total_senas: int
    completadas: int
    promedio: float
    items: list[ProgressItemOut]
