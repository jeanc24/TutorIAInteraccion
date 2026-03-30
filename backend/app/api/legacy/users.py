from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.infrastructure.db.models import User
from app.infrastructure.db.session import get_db
from app.modules.users.schemas import UserOut, UserRequest
from app.modules.users.service import UsersService


router = APIRouter(prefix="/api/usuarios", tags=["legacy-users"])


@router.get("", response_model=list[UserOut], dependencies=[Depends(get_current_admin)])
def list_users(db: Session = Depends(get_db)) -> list[User]:
    return UsersService(db).list_users()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_user(payload: UserRequest, db: Session = Depends(get_db)) -> User:
    return UsersService(db).create_user(payload)


@router.put("/{user_id}", response_model=UserOut, dependencies=[Depends(get_current_admin)])
def update_user(user_id: int, payload: UserRequest, db: Session = Depends(get_db)) -> User:
    return UsersService(db).update_user(user_id, payload)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_user(user_id: int, db: Session = Depends(get_db)) -> Response:
    UsersService(db).delete_user(user_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
