from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models import User


class ContentService:
    def __init__(self, db: Session):
        self.db = db

    def ensure_admin(self, admin_email: str, admin_name: str, admin_password_hash: str) -> None:
        if not self.db.scalar(select(User).where(User.email == admin_email)):
            self.db.add(
                User(
                    nombre=admin_name,
                    email=admin_email,
                    password_hash=admin_password_hash,
                    rol="ADMIN",
                )
            )
            self.db.commit()
