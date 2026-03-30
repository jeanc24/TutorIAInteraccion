from __future__ import annotations

import asyncio
from time import sleep

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.responses import StreamingResponse

from app.modules.vision.schemas import VisionStartRequest
from app.modules.vision.service import get_camera_manager


router = APIRouter(prefix="/api/vision", tags=["vision"])


@router.post("/iniciar")
def start_vision(payload: VisionStartRequest) -> dict:
    manager = get_camera_manager()
    return manager.start(
        mode=payload.mode,
        session_id=payload.session_id,
        user_id=payload.usuario_id,
        sign_id=payload.sena_id,
        target_name=payload.target_name,
    )


@router.post("/detener")
def stop_vision() -> dict[str, str]:
    return get_camera_manager().stop()


@router.get("/stream")
def stream_vision() -> StreamingResponse:
    manager = get_camera_manager()

    def frame_generator():
        while True:
            frame = manager.get_latest_frame()
            if frame:
                yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + frame + b"\r\n"
            else:
                sleep(0.08)
                continue
            sleep(0.05)

    return StreamingResponse(
        frame_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame",
    )


@router.websocket("/eventos")
async def vision_events(websocket: WebSocket) -> None:
    await websocket.accept()
    manager = get_camera_manager()
    last_version = -1
    try:
        while True:
            version, event = manager.get_latest_event()
            if version != last_version:
                await websocket.send_json(event.model_dump(mode="json"))
                last_version = version
            await asyncio.sleep(0.1)
    except WebSocketDisconnect:
        return
