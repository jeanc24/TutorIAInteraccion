from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.infrastructure.db.session import get_db
from app.modules.auth.schemas import LoginRequest, LoginResponse, SignUpRequest
from app.modules.auth.service import AuthService


router = APIRouter(prefix="/api/auth", tags=["legacy-auth"])


@router.post("/signup", status_code=status.HTTP_201_CREATED)
def sign_up(payload: SignUpRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    return AuthService(db).sign_up(payload)


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    return AuthService(db).login(payload)
