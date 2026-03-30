from __future__ import annotations


def test_practice_session_flow(client):
    login = client.post(
        "/api/auth/login",
        json={"email": "admin@tutor.com", "password": "admin123"},
    )
    user_id = login.json()["usuario"]["id"]
    sign_id = client.get("/api/senas").json()[0]["id"]

    created = client.post(
        "/api/sesiones-practica",
        json={"usuario_id": user_id, "sena_id": sign_id},
    )
    assert created.status_code == 201
    session_id = created.json()["id"]

    status_response = client.get(f"/api/sesiones-practica/{session_id}")
    assert status_response.status_code == 200
    assert status_response.json()["estado"] in {"pending", "running"}

    finalized = client.post(f"/api/sesiones-practica/{session_id}/finalizar")
    assert finalized.status_code == 200
    assert finalized.json()["estado"] == "completed"


def test_tutor_config_and_lessons(client):
    config_response = client.get("/api/tutor/config")
    assert config_response.status_code == 200
    assert config_response.json()["vision_mode"] == "local_backend"

    lessons_response = client.get("/api/lecciones")
    assert lessons_response.status_code == 200
    lessons = lessons_response.json()
    assert len(lessons) >= 1

    exercises_response = client.get(f"/api/lecciones/{lessons[0]['id']}/ejercicios")
    assert exercises_response.status_code == 200
    assert len(exercises_response.json()) >= 1
