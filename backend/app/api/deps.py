from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import InvalidTokenError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import LegacyAPIError
from app.core.security import decode_access_token
from app.infrastructure.db.models import User
from app.infrastructure.db.session import get_db


bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise LegacyAPIError(401, "Autenticación requerida")
    try:
        payload = decode_access_token(credentials.credentials)
    except InvalidTokenError as exc:  # pragma: no cover - library integration
        raise LegacyAPIError(401, "Token inválido") from exc

    email = payload.get("sub")
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        raise LegacyAPIError(401, "Usuario no autorizado")
    return user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.rol.upper() != "ADMIN":
        raise LegacyAPIError(403, "Acceso denegado. Solo administradores.")
    return current_user
