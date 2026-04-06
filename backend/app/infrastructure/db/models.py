from __future__ import annotations

from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.base import Base


def utcnow() -> datetime:
    return datetime.now(UTC)


class User(Base):
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    rol: Mapped[str] = mapped_column(String(50), default="ESTUDIANTE", nullable=False)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    fecha_registro: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    profile: Mapped["UserProfile | None"] = relationship(back_populates="user", uselist=False)
    sessions: Mapped[list["PracticeSession"]] = relationship(back_populates="user")
    progress_items: Mapped[list["UserProgress"]] = relationship(back_populates="user")
    audits: Mapped[list["AuditLog"]] = relationship(back_populates="user")


class UserProfile(Base):
    __tablename__ = "perfiles_usuario"

    user_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), primary_key=True)
    idioma_objetivo: Mapped[str | None] = mapped_column(String(80))
    mano_dominante: Mapped[str | None] = mapped_column(String(20))
    nivel: Mapped[str | None] = mapped_column(String(40))
    preferencias: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    user: Mapped[User] = relationship(back_populates="profile")


class Lesson(Base):
    __tablename__ = "lecciones"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(160), nullable=False)
    descripcion: Mapped[str | None] = mapped_column(Text)
    categoria: Mapped[str] = mapped_column(String(100), nullable=False)
    dificultad: Mapped[str] = mapped_column(String(40), nullable=False, default="FACIL")
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    activo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    exercises: Mapped[list["Exercise"]] = relationship(back_populates="lesson", cascade="all, delete-orphan")
    sessions: Mapped[list["PracticeSession"]] = relationship(back_populates="lesson")


class Sign(Base):
    __tablename__ = "senas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(160), nullable=False)
    categoria: Mapped[str] = mapped_column(String(120), nullable=False)
    dificultad: Mapped[str] = mapped_column(String(40), nullable=False)
    video_referencia_url: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    gesture_type: Mapped[str] = mapped_column(String(40), nullable=False, default="STATIC")
    handedness: Mapped[str] = mapped_column(String(20), nullable=False, default="RIGHT")
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    exercises: Mapped[list["Exercise"]] = relationship(back_populates="sign")
    templates: Mapped[list["SignTemplate"]] = relationship(
        back_populates="sign", cascade="all, delete-orphan"
    )
    progress_items: Mapped[list["UserProgress"]] = relationship(back_populates="sign")


class Exercise(Base):
    __tablename__ = "ejercicios"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lesson_id: Mapped[int] = mapped_column(ForeignKey("lecciones.id"), nullable=False)
    sign_id: Mapped[int] = mapped_column(ForeignKey("senas.id"), nullable=False)
    orden: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    tipo: Mapped[str] = mapped_column(String(40), nullable=False, default="STATIC")
    threshold_success: Mapped[float] = mapped_column(Float, nullable=False, default=0.82)
    threshold_warning: Mapped[float] = mapped_column(Float, nullable=False, default=0.48)
    hold_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=600)
    hints_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    lesson: Mapped[Lesson] = relationship(back_populates="exercises")
    sign: Mapped[Sign] = relationship(back_populates="exercises")
    attempts: Mapped[list["PracticeAttempt"]] = relationship(back_populates="exercise")

    __table_args__ = (UniqueConstraint("lesson_id", "orden", name="uq_exercise_lesson_order"),)


class SignTemplate(Base):
    __tablename__ = "plantillas_sena"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sign_id: Mapped[int] = mapped_column(ForeignKey("senas.id"), nullable=False)
    version: Mapped[str] = mapped_column(String(40), nullable=False, default="v1")
    reference_landmarks_json: Mapped[list[list[float]] | None] = mapped_column(JSON)
    feature_profile_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    temporal_pattern_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    sign: Mapped[Sign] = relationship(back_populates="templates")


class PracticeSession(Base):
    __tablename__ = "sesiones_practica"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    usuario_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    leccion_id: Mapped[int | None] = mapped_column(ForeignKey("lecciones.id"))
    sena_id: Mapped[int | None] = mapped_column(ForeignKey("senas.id"))
    estado: Mapped[str] = mapped_column(String(40), nullable=False, default="pending")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    resumen_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    user: Mapped[User | None] = relationship(back_populates="sessions")
    lesson: Mapped[Lesson | None] = relationship(back_populates="sessions")
    sign: Mapped[Sign | None] = relationship()
    attempts: Mapped[list["PracticeAttempt"]] = relationship(
        back_populates="session", cascade="all, delete-orphan"
    )


class PracticeAttempt(Base):
    __tablename__ = "intentos_practica"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("sesiones_practica.id"), nullable=False)
    exercise_id: Mapped[int | None] = mapped_column(ForeignKey("ejercicios.id"))
    sena_id: Mapped[int] = mapped_column(ForeignKey("senas.id"), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence: Mapped[float | None] = mapped_column(Float)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    feedback_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    session: Mapped[PracticeSession] = relationship(back_populates="attempts")
    exercise: Mapped[Exercise | None] = relationship(back_populates="attempts")
    sign: Mapped[Sign] = relationship()


class UserProgress(Base):
    __tablename__ = "progreso_usuario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    sena_id: Mapped[int] = mapped_column(ForeignKey("senas.id"), nullable=False)
    mejor_puntuacion: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    completado: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    intentos: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    fecha_ultimo_intento: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[User] = relationship(back_populates="progress_items")
    sign: Mapped[Sign] = relationship(back_populates="progress_items")

    __table_args__ = (UniqueConstraint("usuario_id", "sena_id", name="uq_user_sign_progress"),)


class MediaAsset(Base):
    __tablename__ = "media_assets"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    sena_id: Mapped[int | None] = mapped_column(ForeignKey("senas.id"))
    storage_type: Mapped[str] = mapped_column(String(40), nullable=False, default="filesystem")
    path: Mapped[str | None] = mapped_column(String(500))
    public_url: Mapped[str | None] = mapped_column(String(500))
    mime_type: Mapped[str | None] = mapped_column(String(120))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    sign: Mapped[Sign | None] = relationship()


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("usuarios.id"))
    action: Mapped[str] = mapped_column(String(80), nullable=False)
    entity: Mapped[str] = mapped_column(String(80), nullable=False)
    entity_id: Mapped[str | None] = mapped_column(String(80))
    payload_json: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    user: Mapped[User | None] = relationship(back_populates="audits")


class AlphabetProgress(Base):
    __tablename__ = "progreso_abecedario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    letter: Mapped[str] = mapped_column(String(2), nullable=False)
    best_score: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    last_practiced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)

    __table_args__ = (UniqueConstraint("usuario_id", "letter", name="uq_user_alphabet_letter"),)


class AlphabetAttempt(Base):
    __tablename__ = "intentos_abecedario"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    usuario_id: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    letter: Mapped[str] = mapped_column(String(2), nullable=False)
    score: Mapped[float] = mapped_column(Float, nullable=False)
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    completed: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    mode: Mapped[str] = mapped_column(String(20), nullable=False, default="practice")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
