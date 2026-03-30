from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.legacy.auth import router as legacy_auth_router
from app.api.legacy.progress import router as legacy_progress_router
from app.api.legacy.signs import router as legacy_signs_router
from app.api.legacy.upload import router as legacy_upload_router
from app.api.legacy.users import router as legacy_users_router
from app.api.v1.lessons import router as lessons_router
from app.api.v1.practice import router as practice_router
from app.api.v1.tutor import router as tutor_router
from app.api.v1.vision import router as vision_router
from app.core.config import get_settings
from app.core.exceptions import LegacyAPIError
from app.core.logging import configure_logging
from app.core.security import hash_password
from app.infrastructure.db.base import Base
from app.infrastructure.db.session import SessionLocal, engine
from app.modules.content.service import ContentService


settings = get_settings()
configure_logging()
settings.upload_dir.mkdir(parents=True, exist_ok=True)
settings.data_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        ContentService(db).ensure_seed_data(
            admin_email=settings.default_admin_email,
            admin_name=settings.default_admin_name,
            admin_password_hash=hash_password(settings.default_admin_password),
        )
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(legacy_auth_router)
app.include_router(legacy_users_router)
app.include_router(legacy_signs_router)
app.include_router(legacy_progress_router)
app.include_router(legacy_upload_router)
app.include_router(lessons_router)
app.include_router(practice_router)
app.include_router(tutor_router)
app.include_router(vision_router)


@app.exception_handler(LegacyAPIError)
async def legacy_error_handler(_: Request, exc: LegacyAPIError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"error": "Datos inválidos", "detail": exc.errors()})


@app.exception_handler(HTTPException)
async def http_error_handler(_: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict) and "error" in exc.detail:
        payload = exc.detail
    elif isinstance(exc.detail, str):
        payload = {"error": exc.detail}
    else:
        payload = {"error": "Error HTTP", "detail": exc.detail}
    return JSONResponse(status_code=exc.status_code, content=payload)


def _file_response(filename: str) -> FileResponse:
    return FileResponse(Path(settings.static_dir) / filename)


@app.get("/", include_in_schema=False)
async def root() -> FileResponse:
    return _file_response("index.html")


@app.get("/index.html", include_in_schema=False)
async def index_html() -> FileResponse:
    return _file_response("index.html")


@app.get("/admin.html", include_in_schema=False)
async def admin_html() -> FileResponse:
    return _file_response("admin.html")


app.mount("/css", StaticFiles(directory=Path(settings.static_dir) / "css"), name="css")
app.mount("/js", StaticFiles(directory=Path(settings.static_dir) / "js"), name="js")
app.mount("/videos", StaticFiles(directory=settings.upload_dir), name="videos")
