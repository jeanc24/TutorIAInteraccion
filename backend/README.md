# TutorAI Backend

Backend FastAPI para el tutor interactivo de lenguaje de señas.

## Qué incluye

- Compatibilidad con los endpoints legacy de la aplicación original.
- Servicio local de visión con cámara usando `OpenCV` y `MediaPipe`.
- API nueva para sesiones de práctica, tutor y progreso.
- Frontend estático servido desde FastAPI, manteniendo la UI actual.

## Ejecutar localmente

1. Instala Python 3.12.
2. Crea un entorno virtual.
3. Instala dependencias:

```bash
pip install -e .[dev]
```

4. Copia `.env.example` a `.env` y ajusta la conexión a PostgreSQL si aplica.
5. Inicia la API:

```bash
uvicorn app.main:app --app-dir backend --reload --port 8888
```

## Variables principales

- `DATABASE_URL`
- `SECRET_KEY`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`
- `VISION_CAMERA_INDEX`
- `VISION_FRAME_WIDTH`
- `VISION_FRAME_HEIGHT`
- `VISION_FPS`

## Notas

- El modo de visión está pensado para correr localmente en la laptop del usuario.
- Si existe `backend/models/hand_landmarker.task`, el tracker prioriza `MediaPipe Tasks`; si no, usa `mediapipe.solutions.hands` como fallback.
- Los assets originales del frontend legado permanecen en `src/main/resources/static`; la nueva app sirve los copiados en `backend/app/static`.
