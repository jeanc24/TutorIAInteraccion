from __future__ import annotations

from pydantic import BaseModel, Field


class FingerPattern(BaseModel):
    thumb: bool | None = None
    index: bool | None = None
    middle: bool | None = None
    ring: bool | None = None
    pinky: bool | None = None


class DistanceCheck(BaseModel):
    from_idx: int = Field(alias="from")
    to_idx: int = Field(alias="to")
    max_distance: float = Field(alias="maxDistance")
    label: str

    model_config = {"populate_by_name": True}


class LetterDataOut(BaseModel):
    letter: str
    name: str
    description: str
    finger_pattern: FingerPattern
    distance_checks: list[DistanceCheck] = []
    gesture_type: str = "STATIC"
    hold_ms: int = 650
    threshold_success: float = 0.78
    difficulty: str = "easy"
    reference_image: str | None = None


class AlphabetOut(BaseModel):
    letters: list[LetterDataOut]
    total: int


class AttemptIn(BaseModel):
    letter: str = Field(min_length=1, max_length=2)
    score: float = Field(ge=0, le=1)
    duration_ms: int = Field(ge=0)
    completed: bool
    mode: str = "practice"


class LetterProgressOut(BaseModel):
    letter: str
    best_score: float
    attempt_count: int
    completed: bool
    last_practiced_at: str | None


class ProgressOut(BaseModel):
    letters: dict[str, LetterProgressOut]
    total_completed: int
    total_letters: int
