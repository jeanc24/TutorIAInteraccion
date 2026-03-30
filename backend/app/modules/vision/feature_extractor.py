from __future__ import annotations

from collections import deque
from dataclasses import dataclass
from math import sqrt
from typing import Iterable


Landmark = tuple[float, float, float]
HistoryFrame = tuple[float, list[Landmark]]
FINGER_NAMES = ("thumb", "index", "middle", "ring", "pinky")


@dataclass(slots=True)
class HandFeatures:
    landmarks: list[Landmark]
    finger_states: dict[str, bool]
    openness: float
    motion_x: float
    motion_y: float
    stability: float
    handedness: str


def _distance(a: Landmark, b: Landmark) -> float:
    return sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2)


def _tip_delta(landmarks_a: list[Landmark], landmarks_b: list[Landmark]) -> float:
    tips = (4, 8, 12, 16, 20)
    return sum(_distance(landmarks_a[i], landmarks_b[i]) for i in tips) / len(tips)


def _thumb_extended(landmarks: list[Landmark], handedness: str) -> bool:
    thumb_tip = landmarks[4]
    thumb_ip = landmarks[3]
    thumb_mcp = landmarks[2]
    if handedness.upper() == "LEFT":
        return thumb_tip[0] > thumb_ip[0] > thumb_mcp[0]
    return thumb_tip[0] < thumb_ip[0] < thumb_mcp[0]


def _finger_extended(landmarks: list[Landmark], tip_idx: int, pip_idx: int, mcp_idx: int) -> bool:
    tip = landmarks[tip_idx]
    pip = landmarks[pip_idx]
    mcp = landmarks[mcp_idx]
    return tip[1] < pip[1] < mcp[1]


def _compute_stability(history: Iterable[HistoryFrame], current: list[Landmark]) -> float:
    snapshots = list(history)
    if not snapshots:
        return 1.0
    deltas = [_tip_delta(frame_landmarks, current) for _, frame_landmarks in snapshots]
    avg_delta = sum(deltas) / len(deltas)
    return max(0.0, 1.0 - min(avg_delta / 0.18, 1.0))


def extract_features(
    landmarks: list[Landmark],
    handedness: str,
    history: deque[HistoryFrame],
) -> HandFeatures:
    finger_states = {
        "thumb": _thumb_extended(landmarks, handedness),
        "index": _finger_extended(landmarks, 8, 6, 5),
        "middle": _finger_extended(landmarks, 12, 10, 9),
        "ring": _finger_extended(landmarks, 16, 14, 13),
        "pinky": _finger_extended(landmarks, 20, 18, 17),
    }
    openness = sum(1.0 for is_open in finger_states.values() if is_open) / len(finger_states)

    motion_x = 0.0
    motion_y = 0.0
    if history:
        _, first_landmarks = history[0]
        motion_x = landmarks[0][0] - first_landmarks[0][0]
        motion_y = landmarks[0][1] - first_landmarks[0][1]

    stability = _compute_stability(history, landmarks)
    return HandFeatures(
        landmarks=landmarks,
        finger_states=finger_states,
        openness=openness,
        motion_x=motion_x,
        motion_y=motion_y,
        stability=stability,
        handedness=handedness.upper(),
    )
