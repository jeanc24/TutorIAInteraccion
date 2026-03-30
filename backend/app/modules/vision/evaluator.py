from __future__ import annotations

from dataclasses import dataclass, field
from time import monotonic
from unicodedata import normalize

from app.core.config import get_settings
from app.modules.vision.feature_extractor import FINGER_NAMES, HandFeatures


@dataclass(slots=True)
class GestureRule:
    name: str
    gesture_type: str
    finger_pattern: dict[str, bool | None]
    movement: str | None = None
    movement_threshold: float = 0.08
    hold_ms: int = 650
    threshold_success: float = 0.82
    threshold_warning: float = 0.48


@dataclass(slots=True)
class EvaluationContext:
    pose_started_at: float | None = None
    dynamic_phase: str = "idle"
    current_step: int = 1
    last_completed_at: float = 0.0


@dataclass(slots=True)
class EvaluationResult:
    status: str
    score: float
    completed: bool
    feedback: str
    confidence: float
    current_step: int
    landmarks: list[list[float]] | None = None
    corrections: list[str] = field(default_factory=list)


def _normalize_name(name: str) -> str:
    lowered = normalize("NFKD", name).encode("ascii", "ignore").decode("ascii").lower()
    return " ".join(lowered.split())


def resolve_rule_for_sign(sign_name: str | None) -> GestureRule:
    key = _normalize_name(sign_name or "")
    if "hola" in key or "adios" in key:
        return GestureRule(
            name=sign_name or "saludo",
            gesture_type="DYNAMIC",
            finger_pattern={finger: True for finger in FINGER_NAMES},
            movement="wave_x",
            movement_threshold=0.10,
            hold_ms=300,
        )
    if "gracias" in key or "bienvenido" in key:
        return GestureRule(
            name=sign_name or "cortesia",
            gesture_type="STATIC",
            finger_pattern={finger: True for finger in FINGER_NAMES},
            hold_ms=700,
        )
    if key in {"si", "sí"} or "puno" in key or "puño" in key:
        return GestureRule(
            name=sign_name or "si",
            gesture_type="STATIC",
            finger_pattern={finger: False for finger in FINGER_NAMES},
            hold_ms=650,
        )
    if key == "no" or "negacion" in key:
        return GestureRule(
            name=sign_name or "no",
            gesture_type="STATIC",
            finger_pattern={
                "thumb": False,
                "index": True,
                "middle": True,
                "ring": False,
                "pinky": False,
            },
            hold_ms=650,
        )
    if "amor" in key:
        return GestureRule(
            name=sign_name or "amor",
            gesture_type="STATIC",
            finger_pattern={
                "thumb": True,
                "index": True,
                "middle": False,
                "ring": False,
                "pinky": True,
            },
            hold_ms=700,
        )
    return GestureRule(
        name=sign_name or "default",
        gesture_type="STATIC",
        finger_pattern={finger: True for finger in FINGER_NAMES},
        hold_ms=650,
    )


class GestureEvaluator:
    def __init__(self):
        self.settings = get_settings()

    def evaluate(
        self,
        rule: GestureRule,
        features: HandFeatures,
        context: EvaluationContext,
    ) -> EvaluationResult:
        now = monotonic()
        finger_score, corrections = self._score_fingers(rule, features)
        stability_score = features.stability
        motion_score = self._score_motion(rule, features)
        total_score = (0.4 * finger_score) + (0.2 * 1.0) + (0.2 * 1.0) + (
            0.2 * (motion_score if rule.gesture_type == "DYNAMIC" else stability_score)
        )

        completed = False
        feedback = "Coloca la mano dentro del recuadro."
        status = "idle"

        if rule.gesture_type == "STATIC":
            if total_score >= rule.threshold_success:
                if context.pose_started_at is None:
                    context.pose_started_at = now
                elapsed_ms = (now - context.pose_started_at) * 1000
                if elapsed_ms >= rule.hold_ms:
                    completed = True
                    status = "success"
                    feedback = "Seña completada con buena estabilidad."
                else:
                    status = "tracking"
                    feedback = "Mantén la postura un instante más."
            else:
                context.pose_started_at = None
                status = "error" if total_score < rule.threshold_warning else "tracking"
                feedback = (
                    f"Ajusta: {', '.join(corrections)}"
                    if corrections
                    else "Corrige la postura de la mano."
                )
        else:
            context.pose_started_at = None
            if finger_score >= 0.8 and motion_score >= 1.0:
                completed = True
                status = "success"
                feedback = "Movimiento completado."
            elif finger_score >= 0.8:
                status = "tracking"
                feedback = "Muy bien, ahora mueve la mano de lado a lado."
            else:
                status = "error" if total_score < rule.threshold_warning else "tracking"
                feedback = (
                    f"Abre mejor la mano: {', '.join(corrections)}"
                    if corrections
                    else "Abre la mano y repite el saludo."
                )

        if completed:
            context.last_completed_at = now

        return EvaluationResult(
            status=status,
            score=max(0.0, min(total_score, 1.0)),
            completed=completed,
            feedback=feedback,
            confidence=max(0.0, min((finger_score + motion_score + stability_score) / 3, 1.0)),
            current_step=context.current_step,
            landmarks=[[x, y, z] for x, y, z in features.landmarks],
            corrections=corrections,
        )

    def _score_fingers(self, rule: GestureRule, features: HandFeatures) -> tuple[float, list[str]]:
        matches = 0
        corrections: list[str] = []
        checked = 0
        for finger, expected in rule.finger_pattern.items():
            if expected is None:
                continue
            checked += 1
            actual = features.finger_states[finger]
            if actual == expected:
                matches += 1
            else:
                corrections.append(self._finger_hint(finger, expected))
        return (matches / checked if checked else 1.0), corrections

    def _score_motion(self, rule: GestureRule, features: HandFeatures) -> float:
        if not rule.movement:
            return features.stability
        if rule.movement == "wave_x":
            return min(abs(features.motion_x) / rule.movement_threshold, 1.0)
        if rule.movement == "raise_y":
            return min(abs(features.motion_y) / rule.movement_threshold, 1.0)
        return 0.0

    def _finger_hint(self, finger: str, expected: bool) -> str:
        action = "extiende" if expected else "flexiona"
        return f"{action} {finger}"
