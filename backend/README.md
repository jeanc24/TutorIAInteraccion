# SignTutor — Documentación completa del proyecto

## Descripcion del proyecto

**SignTutor** es una plataforma web educativa para aprender el abecedario dactilológico (A–Z + Ñ) en lengua de señas. El usuario practica cada letra frente a su cámara y recibe retroalimentación en tiempo real gracias a visión por computadora ejecutada directamente en el navegador.

### Características principales

- Aprendizaje visual de las 27 letras del abecedario con imágenes de referencia
- Práctica con cámara y detección de manos en tiempo real (MediaPipe Hands)
- Evaluación gestual con retroalimentación inmediata por dedo
- Modo quiz sin referencia visual para evaluar retención
- Registro de progreso por letra (local y con cuenta)
- Interfaz minimalista diseñada para concentración y aprendizaje

---

## Arquitectura del sistema

```
┌─────────────────────────────────┐       ┌──────────────────────────────┐
│  Frontend (Next.js)             │       │  Backend (FastAPI)            │
│                                 │       │                              │
│  - React 18 + Tailwind CSS     │ REST  │  - Autenticación JWT         │
│  - MediaPipe Hands (WASM)      │──────▶│  - Catálogo de 27 letras     │
│  - Evaluación gestual local    │       │  - Progreso por usuario      │
│  - Progreso en localStorage    │       │  - Admin seed automático     │
│                                 │       │                              │
│  Puerto: 3000                   │       │  Puerto: 8888                │
└─────────────────────────────────┘       └──────────────┬───────────────┘
                                                         │
                                          ┌──────────────▼───────────────┐
                                          │  PostgreSQL 16               │
                                          │  (Docker) / SQLite (local)   │
                                          │  Puerto: 5432                │
                                          └──────────────────────────────┘
```

El procesamiento de visión por computadora se ejecuta **en el navegador** del usuario con MediaPipe Hands (WASM/WebGL). El backend solo maneja persistencia, autenticación y el catálogo de letras.

---

## Estructura del proyecto

```
TutorIAInteraccion/
│
├── frontend/                          # Aplicación Next.js
│   ├── src/
│   │   ├── app/                       # Páginas de la aplicación
│   │   │   ├── page.tsx               #   Landing page
│   │   │   ├── learn/page.tsx         #   Aprender: selector + referencia visual
│   │   │   ├── practice/page.tsx      #   Practicar: cámara + evaluación
│   │   │   ├── quiz/page.tsx          #   Evaluar: quiz sin referencia
│   │   │   ├── progress/page.tsx      #   Progreso: estadísticas por letra
│   │   │   └── layout.tsx             #   Layout raíz
│   │   │
│   │   ├── components/                # Componentes React
│   │   │   ├── Header.tsx             #   Navegación + indicador de progreso
│   │   │   ├── AlphabetGrid.tsx       #   Grilla de 27 letras con estado
│   │   │   ├── LetterDisplay.tsx      #   Ficha de una letra (imagen + descripción)
│   │   │   ├── CameraFeed.tsx         #   Feed de cámara + overlay de landmarks
│   │   │   ├── FeedbackBar.tsx        #   Barra de retroalimentación y score
│   │   │   ├── SuccessAnimation.tsx   #   Animación al completar una letra
│   │   │   ├── LetterNavigation.tsx   #   Botones anterior/siguiente
│   │   │   └── ProgressDots.tsx       #   Indicador visual compacto
│   │   │
│   │   ├── hooks/                     # React Hooks personalizados
│   │   │   ├── useCamera.ts           #   Acceso a cámara via WebRTC
│   │   │   ├── useHandTracking.ts     #   MediaPipe Hands (detección de 2 manos)
│   │   │   └── useProgress.ts         #   Gestión de progreso (localStorage)
│   │   │
│   │   └── lib/                       # Lógica de negocio
│   │       ├── types.ts               #   Tipos TypeScript del dominio
│   │       ├── alphabet.ts            #   Catálogo de 27 letras con reglas
│   │       ├── features.ts            #   Extracción de features desde landmarks
│   │       ├── evaluator.ts           #   Motor de evaluación gestual
│   │       └── progress.ts            #   Persistencia en localStorage
│   │
│   ├── public/alphabet/               # 27 imágenes PNG de referencia (A-Z + Ñ)
│   ├── Dockerfile                     # Multi-stage build (deps → build → runner)
│   ├── .dockerignore
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/                           # API FastAPI (Python)
│   ├── app/
│   │   ├── main.py                    #   Punto de entrada, lifespan, routers
│   │   ├── api/
│   │   │   ├── deps.py                #   Dependencias (JWT auth)
│   │   │   ├── legacy/auth.py         #   POST /api/auth/signup, /login
│   │   │   └── v2/alphabet.py         #   GET/POST /api/v2/alphabet/*
│   │   ├── core/
│   │   │   ├── config.py              #   Settings (Pydantic)
│   │   │   ├── security.py            #   JWT, hashing de contraseñas
│   │   │   ├── exceptions.py          #   Excepciones personalizadas
│   │   │   └── logging.py             #   Configuración de structlog
│   │   ├── infrastructure/db/
│   │   │   ├── base.py                #   Base declarativa de SQLAlchemy
│   │   │   ├── models.py             #   Modelos: User, AlphabetProgress, etc.
│   │   │   └── session.py             #   Engine y SessionLocal
│   │   └── modules/
│   │       ├── auth/                  #   Servicio y schemas de autenticación
│   │       ├── alphabet/              #   Catálogo, reglas, progreso del abecedario
│   │       │   ├── data.py            #     27 letras con finger patterns
│   │       │   ├── schemas.py         #     Pydantic schemas del API
│   │       │   └── service.py         #     Lógica de catálogo y progreso
│   │       └── content/               #   Seed del admin al iniciar
│   │
│   ├── tests/                         # Tests con pytest
│   │   ├── conftest.py                #   Fixtures (TestClient, DB en SQLite)
│   │   ├── test_legacy_api.py         #   Tests de auth
│   │   └── test_practice_and_tutor.py #   Tests del API de alfabeto
│   │
│   ├── Dockerfile                     # Python 3.12-slim
│   ├── .dockerignore
│   ├── requirements.txt               # Dependencias de producción
│   ├── pyproject.toml                  # Metadata + deps de desarrollo
│   └── .env.example                    # Variables de entorno de ejemplo
│
├── datasets/                          # Datasets (NO incluidos en Docker)
│   ├── ASL_Alphabet_Dataset/          #   ~207K imágenes train (A-Z) + 28 test
│   ├── sign-language-mnist/           #   CSVs tipo MNIST para entrenamiento
│   └── sign_language_letters/         #   27 ilustraciones (usadas como referencia)
│
├── docker-compose.yml                 # Orquestación: DB + Backend + Frontend
├── .env.example                       # Variables para docker-compose
├── .gitignore
└── README.md
```

---

## Opción 1: Ejecución con Docker (recomendado)

La forma más sencilla de levantar toda la plataforma es con Docker Compose. Se crean 3 contenedores: PostgreSQL, Backend y Frontend.

### Requisitos previos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose
- Al menos 4GB de RAM disponible

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd TutorIAInteraccion

# 2. Crear archivo de configuración
cp .env.example .env
```

Editar el archivo `.env` con valores seguros:

```env
SECRET_KEY=una-clave-secreta-de-al-menos-32-caracteres
ADMIN_EMAIL=admin@signtutor.com
ADMIN_PASSWORD=tu-contraseña-segura
```

```bash
# 3. Construir y levantar los 3 servicios
docker compose up -d --build

# 4. Verificar que todo está corriendo
docker compose ps
```

Una vez levantado:

| Servicio | URL | Descripción |
|----------|-----|-------------|
| **Frontend** | http://localhost:3000 | Aplicación web principal |
| **Backend API** | http://localhost:8888/docs | Documentación Swagger interactiva |
| **PostgreSQL** | localhost:5432 | Base de datos (acceso directo) |

### Comandos útiles de Docker

```bash
# Ver logs en tiempo real
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f backend
docker compose logs -f frontend

# Detener todo
docker compose down

# Detener y eliminar datos (reinicio limpio)
docker compose down -v

# Reconstruir tras cambios en el código
docker compose up -d --build

# Entrar al contenedor del backend
docker compose exec backend bash

# Ejecutar tests dentro del contenedor
docker compose exec backend python -m pytest tests/ -v
```

### Diagrama de servicios Docker

```
docker-compose.yml
│
├── db (postgres:16-alpine)
│   ├── Puerto: 5432
│   ├── Volumen persistente: signtutor_postgres
│   └── Healthcheck: pg_isready
│
├── backend (Python 3.12-slim)
│   ├── Puerto: 8888
│   ├── Depende de: db (espera healthcheck)
│   ├── Variables: DATABASE_URL, SECRET_KEY, ADMIN_EMAIL
│   └── Auto-crea tablas y admin al iniciar
│
└── frontend (Node 20-alpine, multi-stage)
    ├── Puerto: 3000
    ├── Depende de: backend
    └── Build: deps → next build (standalone) → runner (~150MB)
```

---

## Opción 2: Ejecución local (desarrollo)

Para desarrollo, se ejecutan el frontend y backend por separado. No se necesita Docker ni PostgreSQL (el backend usa SQLite por defecto).

### Requisitos previos

- Python 3.12 o superior
- Node.js 18 o superior
- npm

### Backend

```bash
# Ir al directorio del backend
cd backend

# Crear entorno virtual de Python
python -m venv .venv

# Activar el entorno (Windows PowerShell)
.\.venv\Scripts\activate

# Activar el entorno (Linux / macOS)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar el servidor (usa SQLite automáticamente)
uvicorn app.main:app --reload --port 8888
```

El backend estará disponible en http://localhost:8888

- Documentación Swagger: http://localhost:8888/docs
- Documentación ReDoc: http://localhost:8888/redoc

Al iniciar por primera vez, se crea automáticamente:
- La base de datos SQLite en `backend/data/tutorai.db`
- Un usuario administrador con las credenciales por defecto

### Frontend

En otra terminal:

```bash
# Ir al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en http://localhost:3000

### Ejecutar tests

```bash
cd backend
python -m pytest tests/ -v
```

Los 8 tests verifican:
- Login y registro de usuarios
- Catálogo de 27 letras del abecedario
- Consulta individual de letras
- Protección de endpoints con auth
- Registro de intentos y progreso
- Health check

---

## API del Backend

### Autenticación

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/auth/signup` | No | Crear cuenta (nombre, email, password) |
| `POST` | `/api/auth/login` | No | Login, devuelve JWT + datos de usuario |

**Ejemplo de login:**
```bash
curl -X POST http://localhost:8888/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@signtutor.com", "password": "admin123"}'
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id": 1,
    "nombre": "Administrador",
    "email": "admin@signtutor.com",
    "rol": "ADMIN"
  }
}
```

### Abecedario

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `GET` | `/api/v2/alphabet` | No | Catálogo completo (27 letras con reglas) |
| `GET` | `/api/v2/alphabet/{letter}` | No | Detalle de una letra (ej: `/api/v2/alphabet/A`) |

**Ejemplo de respuesta de una letra:**
```json
{
  "letter": "A",
  "name": "A",
  "description": "Cierra el puño y coloca el pulgar al lado del índice.",
  "finger_pattern": {
    "thumb": true,
    "index": false,
    "middle": false,
    "ring": false,
    "pinky": false
  },
  "gesture_type": "STATIC",
  "hold_ms": 650,
  "threshold_success": 0.78,
  "difficulty": "easy"
}
```

### Progreso (requiere JWT)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/api/v2/alphabet/progress/attempt` | JWT | Registrar un intento de práctica |
| `GET` | `/api/v2/alphabet/progress/me` | JWT | Consultar progreso completo del usuario |

**Ejemplo de registrar un intento:**
```bash
curl -X POST http://localhost:8888/api/v2/alphabet/progress/attempt \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"letter": "A", "score": 0.92, "duration_ms": 3400, "completed": true, "mode": "practice"}'
```

### Utilidades

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/api/health` | Health check (`{"status": "ok"}`) |

---

## Variables de entorno

### Para Docker (`/.env`)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `SECRET_KEY` | `change-this-secret-in-production` | Clave para firmar tokens JWT |
| `ADMIN_EMAIL` | `admin@signtutor.com` | Email del admin creado al iniciar |
| `ADMIN_PASSWORD` | `admin123` | Contraseña del admin |

### Para desarrollo local (`/backend/.env`)

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `APP_ENV` | `development` | Entorno de ejecución |
| `SECRET_KEY` | `change-this-secret-key` | Clave JWT |
| `DATABASE_URL` | SQLite automático | URL de conexión a PostgreSQL |
| `DEFAULT_ADMIN_EMAIL` | `admin@tutor.com` | Email del admin |
| `DEFAULT_ADMIN_PASSWORD` | `admin123` | Contraseña del admin |

---

## Datasets disponibles

Los datasets no se incluyen en los contenedores Docker. Son para desarrollo, referencia visual y entrenamiento futuro de modelos ML.

| Dataset | Tamaño | Contenido | Uso actual |
|---------|--------|-----------|------------|
| `sign_language_letters/` | 291 KB | 27 ilustraciones PNG (A-Z + Ñ) | Imágenes de referencia en el frontend |
| `ASL_Alphabet_Dataset/` | ~4.5 GB | ~207K fotos de webcam (train) + 28 test | Disponible para entrenar clasificador ML |
| `sign-language-mnist/` | 65 MB | CSVs tipo MNIST (train + test) | Disponible para entrenar clasificador ML |

---

## Tecnologías

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Frontend | Next.js (React) | 14 |
| Estilos | Tailwind CSS | 3 |
| Reconocimiento | MediaPipe Hands | WASM (navegador) |
| Backend | FastAPI | 0.116+ |
| ORM | SQLAlchemy | 2.0+ |
| Validación | Pydantic | 2.8+ |
| Base de datos | PostgreSQL / SQLite | 16 / 3 |
| Auth | JWT (PyJWT + passlib) | — |
| Tests | pytest + httpx | — |
| Contenedores | Docker + Docker Compose | — |
| Logging | structlog | 24+ |
