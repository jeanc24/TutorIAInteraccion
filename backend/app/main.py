from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.legacy.auth import router as auth_router
from app.api.v2.alphabet import router as alphabet_router
from app.core.config import get_settings
from app.core.exceptions import LegacyAPIError
from app.core.logging import configure_logging
from app.core.security import hash_password
from app.infrastructure.db.base import Base
from app.infrastructure.db.session import SessionLocal, engine
from app.modules.content.service import ContentService


settings = get_settings()
configure_logging()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    Base.metadata.create_all(bind=engine)

    with SessionLocal() as db:
        ContentService(db).ensure_admin(
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

app.include_router(auth_router)
app.include_router(alphabet_router)


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


@app.get("/api/health")
async def health():
    return {"status": "ok"}
