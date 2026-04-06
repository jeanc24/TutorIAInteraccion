from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.infrastructure.db.models import User
from app.infrastructure.db.session import get_db
from app.modules.alphabet.schemas import AlphabetOut, AttemptIn, LetterDataOut, LetterProgressOut, ProgressOut
from app.modules.alphabet.service import AlphabetService

router = APIRouter(prefix="/api/v2/alphabet", tags=["alphabet"])


@router.get("", response_model=AlphabetOut)
def get_alphabet(db: Session = Depends(get_db)):
    svc = AlphabetService(db)
    letters = svc.get_catalog()
    return AlphabetOut(letters=letters, total=len(letters))


@router.get("/{letter}", response_model=LetterDataOut)
def get_letter(letter: str, db: Session = Depends(get_db)):
    svc = AlphabetService(db)
    result = svc.get_letter(letter)
    if not result:
        raise HTTPException(status_code=404, detail=f"Letra '{letter}' no encontrada")
    return result


@router.post("/progress/attempt", response_model=LetterProgressOut)
def record_attempt(
    attempt: AttemptIn,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = AlphabetService(db)
    return svc.record_attempt(user.id, attempt)


@router.get("/progress/me", response_model=ProgressOut)
def get_my_progress(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    svc = AlphabetService(db)
    return svc.get_progress(user.id)
