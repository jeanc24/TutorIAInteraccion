from __future__ import annotations

from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


BACKEND_DIR = Path(__file__).resolve().parents[2]
APP_DIR = BACKEND_DIR / "app"
STATIC_DIR = APP_DIR / "static"
DATA_DIR = BACKEND_DIR / "data"
UPLOAD_DIR = BACKEND_DIR / "uploads"
MODELS_DIR = BACKEND_DIR / "models"


def _default_sqlite_url() -> str:
    db_path = (DATA_DIR / "tutorai.db").resolve().as_posix()
    return f"sqlite:///{db_path}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", ".env.local"),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "TutorAI Sign Backend"
    app_env: str = Field(default="development", alias="APP_ENV")
    api_prefix: str = "/api"

    secret_key: str = Field(default="change-this-secret-key", alias="SECRET_KEY")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24

    database_url: str = Field(default_factory=_default_sqlite_url, alias="DATABASE_URL")

    default_admin_email: str = Field(default="admin@tutor.com", alias="DEFAULT_ADMIN_EMAIL")
    default_admin_password: str = Field(default="admin123", alias="DEFAULT_ADMIN_PASSWORD")
    default_admin_name: str = Field(default="Administrador", alias="DEFAULT_ADMIN_NAME")

    cors_origins: list[str] = ["*"]

    vision_camera_index: int = Field(default=0, alias="VISION_CAMERA_INDEX")
    vision_frame_width: int = Field(default=640, alias="VISION_FRAME_WIDTH")
    vision_frame_height: int = Field(default=480, alias="VISION_FRAME_HEIGHT")
    vision_fps: int = Field(default=15, alias="VISION_FPS")
    vision_score_threshold: float = 0.82
    vision_warning_threshold: float = 0.48
    vision_success_cooldown_seconds: float = 2.0
    vision_tasks_model_path: str = Field(
        default=str((MODELS_DIR / "hand_landmarker.task").resolve()),
        alias="VISION_TASKS_MODEL_PATH",
    )

    static_dir: Path = STATIC_DIR
    upload_dir: Path = UPLOAD_DIR
    data_dir: Path = DATA_DIR
    models_dir: Path = MODELS_DIR


@lru_cache
def get_settings() -> Settings:
    return Settings()
