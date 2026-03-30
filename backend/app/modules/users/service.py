from __future__ import annotations

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.exceptions import LegacyAPIError
from app.core.security import hash_password
from app.infrastructure.db.models import AuditLog, PracticeAttempt, PracticeSession, User, UserProfile, UserProgress
from app.modules.users.schemas import UserRequest


class UsersService:
    def __init__(self, db: Session):
        self.db = db

    def list_users(self) -> list[User]:
        return list(self.db.scalars(select(User).order_by(User.id)))

    def create_user(self, payload: UserRequest) -> User:
        if self.db.scalar(select(User).where(User.email == payload.email.lower())):
            raise LegacyAPIError(409, "Ya existe un usuario con ese email")
        if not payload.password or len(payload.password) < 6:
            raise LegacyAPIError(400, "La contraseña debe tener al menos 6 caracteres")

        user = User(
            nombre=payload.nombre.strip(),
            email=payload.email.lower(),
            password_hash=hash_password(payload.password),
            rol=(payload.rol or "ESTUDIANTE").upper(),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_user(self, user_id: int, payload: UserRequest) -> User:
        user = self.db.get(User, user_id)
        if not user:
            raise LegacyAPIError(404, "Usuario no encontrado")

        duplicate = self.db.scalar(select(User).where(User.email == payload.email.lower(), User.id != user_id))
        if duplicate:
            raise LegacyAPIError(409, "Ya existe un usuario con ese email")

        user.nombre = payload.nombre.strip()
        user.email = payload.email.lower()
        if payload.password:
            user.password_hash = hash_password(payload.password)
        if payload.rol:
            user.rol = payload.rol.upper()

        self.db.commit()
        self.db.refresh(user)
        return user

    def delete_user(self, user_id: int) -> None:
        user = self.db.get(User, user_id)
        if not user:
            raise LegacyAPIError(404, "Usuario no encontrado")
        session_ids = list(
            self.db.scalars(select(PracticeSession.id).where(PracticeSession.usuario_id == user_id))
        )
        self.db.execute(delete(UserProfile).where(UserProfile.user_id == user_id))
        self.db.execute(delete(UserProgress).where(UserProgress.usuario_id == user_id))
        if session_ids:
            self.db.execute(delete(PracticeAttempt).where(PracticeAttempt.session_id.in_(session_ids)))
        self.db.execute(delete(PracticeSession).where(PracticeSession.usuario_id == user_id))
        self.db.execute(delete(AuditLog).where(AuditLog.user_id == user_id))
        self.db.delete(user)
        self.db.commit()
