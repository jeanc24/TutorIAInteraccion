from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.infrastructure.db.models import AlphabetProgress, AlphabetAttempt
from app.modules.alphabet.data import ALPHABET_DATA, ALPHABET_MAP, TOTAL_LETTERS
from app.modules.alphabet.schemas import (
    AttemptIn,
    LetterDataOut,
    LetterProgressOut,
    ProgressOut,
    FingerPattern,
    DistanceCheck,
)


class AlphabetService:
    def __init__(self, db: Session):
        self.db = db

    def get_catalog(self) -> list[LetterDataOut]:
        results = []
        for d in ALPHABET_DATA:
            fp = d.get("fingerPattern", {})
            dcs = d.get("distanceChecks", [])
            results.append(LetterDataOut(
                letter=d["letter"],
                name=d["name"],
                description=d["description"],
                finger_pattern=FingerPattern(**fp),
                distance_checks=[DistanceCheck(**dc) for dc in dcs],
                gesture_type="STATIC",
                hold_ms=d.get("holdMs", 650),
                threshold_success=d.get("thresholdSuccess", 0.78),
                difficulty=d.get("difficulty", "easy"),
            ))
        return results

    def get_letter(self, letter: str) -> LetterDataOut | None:
        d = ALPHABET_MAP.get(letter.upper())
        if not d:
            return None
        fp = d.get("fingerPattern", {})
        dcs = d.get("distanceChecks", [])
        return LetterDataOut(
            letter=d["letter"],
            name=d["name"],
            description=d["description"],
            finger_pattern=FingerPattern(**fp),
            distance_checks=[DistanceCheck(**dc) for dc in dcs],
            gesture_type="STATIC",
            hold_ms=d.get("holdMs", 650),
            threshold_success=d.get("thresholdSuccess", 0.78),
            difficulty=d.get("difficulty", "easy"),
        )

    def record_attempt(self, user_id: int, attempt: AttemptIn) -> LetterProgressOut:
        letter = attempt.letter.upper()
        now = datetime.now(UTC)

        self.db.add(AlphabetAttempt(
            usuario_id=user_id,
            letter=letter,
            score=attempt.score,
            duration_ms=attempt.duration_ms,
            completed=attempt.completed,
            mode=attempt.mode,
            created_at=now,
        ))

        prog = self.db.scalar(
            select(AlphabetProgress).where(
                AlphabetProgress.usuario_id == user_id,
                AlphabetProgress.letter == letter,
            )
        )

        if not prog:
            prog = AlphabetProgress(
                usuario_id=user_id,
                letter=letter,
                best_score=0,
                attempt_count=0,
                completed=False,
            )
            self.db.add(prog)

        prog.attempt_count += 1
        prog.last_practiced_at = now

        if attempt.score > prog.best_score:
            prog.best_score = attempt.score

        if attempt.completed and not prog.completed:
            prog.completed = True

        self.db.commit()
        self.db.refresh(prog)

        return LetterProgressOut(
            letter=prog.letter,
            best_score=prog.best_score,
            attempt_count=prog.attempt_count,
            completed=prog.completed,
            last_practiced_at=prog.last_practiced_at.isoformat() if prog.last_practiced_at else None,
        )

    def get_progress(self, user_id: int) -> ProgressOut:
        rows = self.db.scalars(
            select(AlphabetProgress).where(AlphabetProgress.usuario_id == user_id)
        ).all()

        letters: dict[str, LetterProgressOut] = {}
        total_completed = 0

        for r in rows:
            letters[r.letter] = LetterProgressOut(
                letter=r.letter,
                best_score=r.best_score,
                attempt_count=r.attempt_count,
                completed=r.completed,
                last_practiced_at=r.last_practiced_at.isoformat() if r.last_practiced_at else None,
            )
            if r.completed:
                total_completed += 1

        for d in ALPHABET_DATA:
            if d["letter"] not in letters:
                letters[d["letter"]] = LetterProgressOut(
                    letter=d["letter"],
                    best_score=0,
                    attempt_count=0,
                    completed=False,
                    last_practiced_at=None,
                )

        return ProgressOut(
            letters=letters,
            total_completed=total_completed,
            total_letters=TOTAL_LETTERS,
        )
