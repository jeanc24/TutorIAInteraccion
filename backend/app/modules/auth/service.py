from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import LegacyAPIError
from app.core.security import create_access_token, hash_password, verify_password
from app.infrastructure.db.models import User
from app.modules.auth.schemas import LoginRequest, LoginResponse, SignUpRequest, UserPublic


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def sign_up(self, payload: SignUpRequest) -> dict[str, str]:
        existing = self.db.scalar(select(User).where(User.email == payload.email))
        if existing:
            raise LegacyAPIError(409, "Ya existe un usuario con ese email")

        user = User(
            nombre=payload.nombre.strip(),
            email=payload.email.lower(),
            password_hash=hash_password(payload.password),
            rol="ESTUDIANTE",
        )
        self.db.add(user)
        self.db.commit()
        return {"message": "Usuario registrado"}

    def login(self, payload: LoginRequest) -> LoginResponse:
        user = self.db.scalar(select(User).where(User.email == payload.email.lower()))
        if not user or not verify_password(payload.password, user.password_hash):
            raise LegacyAPIError(401, "Credenciales inválidas")

        token = create_access_token(subject=user.email, role=user.rol)
        return LoginResponse(token=token, usuario=UserPublic.model_validate(user))
