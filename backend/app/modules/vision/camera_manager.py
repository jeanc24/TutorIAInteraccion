from __future__ import annotations

import threading
import time
from collections import deque
from dataclasses import dataclass
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

import numpy as np

from app.core.config import Settings, get_settings
from app.infrastructure.db.session import SessionLocal
from app.modules.feedback.service import FeedbackService
from app.modules.practice.service import PracticeService
from app.modules.progress.service import ProgressService
from app.modules.vision.evaluator import EvaluationContext, GestureEvaluator, resolve_rule_for_sign
from app.modules.vision.feature_extractor import HistoryFrame, Landmark, extract_features
from app.modules.vision.schemas import VisionEvent

try:  # pragma: no cover - depends on runtime packages
    import cv2
except Exception:  # pragma: no cover - fallback when OpenCV is unavailable
    cv2 = None


HAND_CONNECTIONS = (
    (0, 1), (1, 2), (2, 3), (3, 4),
    (0, 5), (5, 6), (6, 7), (7, 8),
    (0, 9), (9, 10), (10, 11), (11, 12),
    (0, 13), (13, 14), (14, 15), (15, 16),
    (0, 17), (17, 18), (18, 19), (19, 20),
)


@dataclass(slots=True)
class DetectionResult:
    landmarks: list[Landmark] | None
    handedness: str
    error: str | None = None


class MediaPipeHandTracker:
    def __init__(self, settings: Settings):
        self.settings = settings
        self._mode = "unavailable"
        self._tasks = None
        self._hands = None
        self._mp = None
        self._error: str | None = None
        self._init_runtime()

    def _init_runtime(self) -> None:  # pragma: no cover - exercised in runtime
        try:
            import mediapipe as mp

            self._mp = mp
            model_path = Path(self.settings.vision_tasks_model_path)
            if model_path.exists():
                from mediapipe.tasks.python import BaseOptions
                from mediapipe.tasks.python.vision import (
                    HandLandmarker,
                    HandLandmarkerOptions,
                    RunningMode,
                )

                options = HandLandmarkerOptions(
                    base_options=BaseOptions(model_asset_path=str(model_path)),
                    running_mode=RunningMode.VIDEO,
                    num_hands=1,
                )
                self._tasks = HandLandmarker.create_from_options(options)
                self._mode = "tasks"
                return

            self._hands = mp.solutions.hands.Hands(
                static_image_mode=False,
                max_num_hands=1,
                model_complexity=1,
                min_detection_confidence=0.6,
                min_tracking_confidence=0.5,
            )
            self._mode = "solutions"
        except Exception as exc:
            self._error = str(exc)

    def detect(self, frame: np.ndarray, timestamp_ms: int) -> DetectionResult:  # pragma: no cover
        if self._mode == "tasks" and self._tasks and self._mp:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = self._mp.Image(image_format=self._mp.ImageFormat.SRGB, data=rgb)
            result = self._tasks.detect_for_video(mp_image, timestamp_ms)
            if not result.hand_landmarks:
                return DetectionResult(landmarks=None, handedness="UNKNOWN")
            landmarks = [
                (landmark.x, landmark.y, getattr(landmark, "z", 0.0))
                for landmark in result.hand_landmarks[0]
            ]
            handedness = "RIGHT"
            if result.handedness:
                handedness = result.handedness[0][0].category_name.upper()
            return DetectionResult(landmarks=landmarks, handedness=handedness)

        if self._mode == "solutions" and self._hands:
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            result = self._hands.process(rgb)
            if not result.multi_hand_landmarks:
                return DetectionResult(landmarks=None, handedness="UNKNOWN")
            landmarks = [
                (landmark.x, landmark.y, getattr(landmark, "z", 0.0))
                for landmark in result.multi_hand_landmarks[0].landmark
            ]
            handedness = "RIGHT"
            if result.multi_handedness:
                handedness = result.multi_handedness[0].classification[0].label.upper()
            return DetectionResult(landmarks=landmarks, handedness=handedness)

        return DetectionResult(landmarks=None, handedness="UNKNOWN", error=self._error or "MediaPipe no disponible")


class CameraManager:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self.feedback_service = FeedbackService()
        self.evaluator = GestureEvaluator()
        self.tracker = MediaPipeHandTracker(self.settings)

        self._lock = threading.Lock()
        self._thread: threading.Thread | None = None
        self._running = False
        self._camera = None
        self._history: deque[HistoryFrame] = deque(maxlen=12)
        self._eval_context = EvaluationContext()

        self.mode = "idle"
        self.session_id: str | None = None
        self.user_id: int | None = None
        self.sign_id: int | None = None
        self.target_name: str | None = None
        self.latest_frame: bytes | None = None
        self.latest_event = VisionEvent(
            session_id=None,
            estado="idle",
            sena_id=None,
            score=0.0,
            paso_actual=1,
            feedback="Sistema listo.",
            landmarks=None,
            timestamp=datetime.now(UTC),
        )
        self.event_version = 0
        self._last_success_at = 0.0

    def start(
        self,
        *,
        mode: str,
        session_id: str | None,
        user_id: int | None,
        sign_id: int | None,
        target_name: str | None,
    ) -> dict[str, Any]:
        with self._lock:
            self.mode = mode
            self.session_id = session_id
            self.user_id = user_id
            self.sign_id = sign_id
            self.target_name = target_name
            self._history.clear()
            self._eval_context = EvaluationContext()
            self._publish_event(
                estado="tracking",
                feedback="Inicializando cámara local...",
                score=0.0,
                landmarks=None,
            )
            if session_id:
                self._mark_session_running(session_id)
            if not self._running:
                self._running = True
                self._thread = threading.Thread(target=self._run_loop, name="vision-worker", daemon=True)
                self._thread.start()
        return {"estado": "running"}

    def stop(self) -> dict[str, str]:
        with self._lock:
            self._running = False
            self.mode = "idle"
            self.session_id = None
            self.user_id = None
            self.sign_id = None
            self.target_name = None
            if self._camera is not None:
                self._camera.release()
                self._camera = None
            self._publish_event(
                estado="idle",
                feedback="Cámara detenida.",
                score=0.0,
                landmarks=None,
            )
        return {"estado": "stopped"}

    def get_latest_frame(self) -> bytes | None:
        return self.latest_frame

    def get_latest_event(self) -> tuple[int, VisionEvent]:
        return self.event_version, self.latest_event

    def _run_loop(self) -> None:  # pragma: no cover - runtime integration
        frame_interval = 1 / max(self.settings.vision_fps, 1)
        while True:
            with self._lock:
                if not self._running:
                    break

            started = time.monotonic()
            frame = self._read_frame()
            if frame is None:
                self._push_placeholder("No se pudo leer la cámara local.")
                time.sleep(frame_interval)
                continue

            detection = self.tracker.detect(frame, int(time.time() * 1000))
            if detection.landmarks:
                features = extract_features(detection.landmarks, detection.handedness, self._history)
                self._history.append((time.monotonic(), detection.landmarks))
                result = self.evaluator.evaluate(
                    resolve_rule_for_sign(self.target_name),
                    features,
                    self._eval_context,
                )
                self._annotate_frame(frame, detection.landmarks, result.status, result.score, result.feedback)
                self._publish_event(
                    estado=result.status,
                    feedback=self.feedback_service.build_message(result.status, result.score, result.feedback),
                    score=result.score,
                    landmarks=result.landmarks,
                )
                if result.completed and (time.monotonic() - self._last_success_at) >= self.settings.vision_success_cooldown_seconds:
                    self._last_success_at = time.monotonic()
                    self._record_success(result.score, result.confidence, result.feedback)
            else:
                self._history.clear()
                self._annotate_frame(frame, None, "idle", 0.0, "Coloca tu mano dentro del cuadro.")
                self._publish_event(
                    estado="idle",
                    feedback=detection.error or "Coloca tu mano dentro del cuadro.",
                    score=0.0,
                    landmarks=None,
                )

            self.latest_frame = self._encode_frame(frame)
            elapsed = time.monotonic() - started
            if elapsed < frame_interval:
                time.sleep(frame_interval - elapsed)

        if self._camera is not None:
            self._camera.release()
            self._camera = None

    def _read_frame(self) -> np.ndarray | None:  # pragma: no cover - runtime integration
        if cv2 is None:
            return None
        if self._camera is None:
            self._camera = cv2.VideoCapture(self.settings.vision_camera_index)
            self._camera.set(cv2.CAP_PROP_FRAME_WIDTH, self.settings.vision_frame_width)
            self._camera.set(cv2.CAP_PROP_FRAME_HEIGHT, self.settings.vision_frame_height)
            self._camera.set(cv2.CAP_PROP_FPS, self.settings.vision_fps)
        if not self._camera.isOpened():
            return None
        ok, frame = self._camera.read()
        if not ok or frame is None:
            return None
        return cv2.flip(frame, 1)

    def _annotate_frame(
        self,
        frame: np.ndarray,
        landmarks: list[Landmark] | None,
        status: str,
        score: float,
        feedback: str,
    ) -> None:  # pragma: no cover - runtime integration
        if cv2 is None:
            return
        height, width = frame.shape[:2]
        cv2.rectangle(frame, (18, 18), (width - 18, height - 18), (0, 229, 255), 2)
        if landmarks:
            points = [(int(x * width), int(y * height)) for x, y, _ in landmarks]
            for start_idx, end_idx in HAND_CONNECTIONS:
                cv2.line(frame, points[start_idx], points[end_idx], (0, 229, 255), 2)
            for point in points:
                cv2.circle(frame, point, 5, (139, 92, 246), -1)

        color = (0, 229, 255)
        if status == "success":
            color = (34, 197, 94)
        elif status == "error":
            color = (244, 63, 94)

        label = self.target_name or "Practica"
        cv2.putText(frame, label, (26, 44), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
        cv2.putText(
            frame,
            f"Precision {round(score * 100)}%",
            (26, 78),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            color,
            2,
        )
        cv2.putText(frame, feedback[:60], (26, height - 28), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)

    def _encode_frame(self, frame: np.ndarray) -> bytes | None:
        if cv2 is None:
            return None
        ok, encoded = cv2.imencode(".jpg", frame)
        return encoded.tobytes() if ok else None

    def _push_placeholder(self, message: str) -> None:  # pragma: no cover - runtime integration
        if cv2 is None:
            self._publish_event(estado="error", feedback=message, score=0.0, landmarks=None)
            return
        frame = np.zeros((self.settings.vision_frame_height, self.settings.vision_frame_width, 3), dtype=np.uint8)
        cv2.putText(frame, "TutorAI Vision", (24, 48), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 229, 255), 2)
        cv2.putText(frame, message[:60], (24, 96), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        self.latest_frame = self._encode_frame(frame)
        self._publish_event(estado="error", feedback=message, score=0.0, landmarks=None)

    def _publish_event(
        self,
        *,
        estado: str,
        feedback: str,
        score: float | None,
        landmarks: list[list[float]] | None,
    ) -> None:
        self.event_version += 1
        self.latest_event = VisionEvent(
            session_id=self.session_id,
            estado=estado,
            sena_id=self.sign_id,
            score=score,
            paso_actual=self._eval_context.current_step,
            feedback=feedback,
            landmarks=landmarks,
            timestamp=datetime.now(UTC),
        )

    def _record_success(self, score: float, confidence: float, feedback: str) -> None:
        if self.user_id and self.sign_id:
            with SessionLocal() as db:
                ProgressService(db).register_attempt(
                    self.user_id,
                    self.sign_id,
                    round(score * 100, 2),
                    session_id=self.session_id,
                    completed=True,
                    confidence=confidence,
                    feedback={"feedback": feedback, "source": "vision"},
                )
                if self.session_id:
                    PracticeService(db).mark_running(
                        self.session_id,
                        score=round(score * 100, 2),
                        feedback=feedback,
                    )

        self._publish_event(
            estado="success",
            feedback=feedback,
            score=score,
            landmarks=self.latest_event.landmarks,
        )

    def _mark_session_running(self, session_id: str) -> None:
        with SessionLocal() as db:
            try:
                PracticeService(db).mark_running(session_id, feedback="Cámara activa")
            except Exception:
                return
