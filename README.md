# SignTutor — Plataforma de Aprendizaje del Abecedario en Lengua de Señas

Plataforma educativa que permite aprender el abecedario dactilológico (A–Z + Ñ) con retroalimentación en tiempo real mediante visión por computadora en el navegador.

## Arquitectura

```
┌─────────────────────────────┐     ┌─────────────────────────┐
│  Frontend (Next.js)         │     │  Backend (FastAPI)       │
│  - React + Tailwind CSS     │────▶│  - Auth (JWT)            │
│  - MediaPipe Hands (WASM)   │     │  - Catálogo de letras    │
│  - Evaluación en navegador  │     │  - Progreso por usuario  │
│  Puerto: 3000               │     │  Puerto: 8888            │
└─────────────────────────────┘     └──────────┬──────────────┘
                                               │
                                    ┌──────────▼──────────────┐
                                    │  PostgreSQL 16           │
                                    │  Puerto: 5432            │
                                    └─────────────────────────┘
```

## Inicio rápido con Docker

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd TutorIAInteraccion

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores (SECRET_KEY, contraseñas, etc.)

# 3. Levantar todo
docker compose up -d

# 4. Abrir en el navegador
# Frontend: http://localhost:3000
# Backend API: http://localhost:8888/docs
```

Para detener:
```bash
docker compose down
```

Para reconstruir tras cambios:
```bash
docker compose up -d --build
```

## Desarrollo local (sin Docker)

### Backend

```bash
cd backend

# Crear entorno virtual
python -m venv .venv

# Activar (Windows)
.\.venv\Scripts\activate

# Activar (Linux/Mac)
source .venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar (usa SQLite por defecto si no hay DATABASE_URL)
uvicorn app.main:app --reload --port 8888
```

### Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Abrir http://localhost:3000
```

## Estructura del proyecto

```
TutorIAInteraccion/
├── frontend/                    # Next.js (React + Tailwind)
│   ├── src/
│   │   ├── app/                 # Páginas (Landing, Learn, Practice, Progress, Quiz)
│   │   ├── components/          # Componentes React
│   │   ├── hooks/               # Hooks (cámara, hand tracking, progreso)
│   │   └── lib/                 # Lógica (evaluador, features, alfabeto)
│   ├── public/alphabet/         # 27 imágenes de referencia (A-Z + Ñ)
│   ├── Dockerfile
│   └── package.json
│
├── backend/                     # FastAPI (Python)
│   ├── app/
│   │   ├── api/                 # Endpoints (auth, alphabet v2)
│   │   ├── core/                # Config, seguridad, logging
│   │   ├── infrastructure/db/   # Modelos SQLAlchemy, sesión
│   │   └── modules/             # Servicios (auth, alphabet, content)
│   ├── tests/
│   ├── Dockerfile
│   └── requirements.txt
│
├── datasets/                    # Datos para entrenamiento (no incluidos en Docker)
│   ├── ASL_Alphabet_Dataset/    # ~207K imágenes de train + 28 test
│   ├── sign-language-mnist/     # CSVs tipo MNIST
│   └── sign_language_letters/   # 27 ilustraciones de referencia
│
├── docker-compose.yml           # Orquestación completa
└── .env.example                 # Variables de entorno de ejemplo
```

## Endpoints del API

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth/signup` | Registro |
| `POST` | `/api/auth/login` | Login → JWT |
| `GET`  | `/api/v2/alphabet` | 27 letras con reglas |
| `GET`  | `/api/v2/alphabet/{letter}` | Detalle de una letra |
| `POST` | `/api/v2/alphabet/progress/attempt` | Registrar intento |
| `GET`  | `/api/v2/alphabet/progress/me` | Progreso del usuario |
| `GET`  | `/api/health` | Health check |

## Tecnologías

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 14, React 18, Tailwind CSS 3 |
| Reconocimiento | MediaPipe Hands (WASM, ejecución en navegador) |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Base de datos | PostgreSQL 16 (Docker) / SQLite (desarrollo local) |
| Auth | JWT (PyJWT + passlib) |
| Contenedores | Docker + Docker Compose |
