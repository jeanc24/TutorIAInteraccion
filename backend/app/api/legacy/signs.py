from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_admin
from app.infrastructure.db.models import Sign
from app.infrastructure.db.session import get_db
from app.modules.content.schemas import SignOut, SignRequest
from app.modules.content.service import ContentService


router = APIRouter(prefix="/api/senas", tags=["legacy-signs"])


@router.get("", response_model=list[SignOut])
def list_signs(db: Session = Depends(get_db)) -> list[Sign]:
    return ContentService(db).list_signs()


@router.get("/{sign_id}", response_model=SignOut)
def get_sign(sign_id: int, db: Session = Depends(get_db)) -> Sign:
    return ContentService(db).get_sign(sign_id)


@router.post("", response_model=SignOut, status_code=status.HTTP_201_CREATED, dependencies=[Depends(get_current_admin)])
def create_sign(payload: SignRequest, db: Session = Depends(get_db)) -> Sign:
    return ContentService(db).create_sign(payload)


@router.put("/{sign_id}", response_model=SignOut, dependencies=[Depends(get_current_admin)])
def update_sign(sign_id: int, payload: SignRequest, db: Session = Depends(get_db)) -> Sign:
    return ContentService(db).update_sign(sign_id, payload)


@router.delete("/{sign_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(get_current_admin)])
def delete_sign(sign_id: int, db: Session = Depends(get_db)) -> Response:
    ContentService(db).delete_sign(sign_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
