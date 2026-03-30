from __future__ import annotations

from functools import lru_cache

from app.modules.vision.camera_manager import CameraManager


@lru_cache
def get_camera_manager() -> CameraManager:
    return CameraManager()
