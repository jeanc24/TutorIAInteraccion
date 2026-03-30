from __future__ import annotations


def test_admin_login_and_public_signs(client):
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@tutor.com", "password": "admin123"},
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert data["usuario"]["rol"] == "ADMIN"
    assert data["token"]

    signs_response = client.get("/api/senas")
    assert signs_response.status_code == 200
    assert isinstance(signs_response.json(), list)
    assert len(signs_response.json()) >= 1


def test_signup_and_progress_contract(client):
    signup = client.post(
        "/api/auth/signup",
        json={"nombre": "Alumno Uno", "email": "alumno1@demo.com", "password": "alumno123"},
    )
    assert signup.status_code == 201
    assert signup.json()["message"] == "Usuario registrado"

    login = client.post(
        "/api/auth/login",
        json={"email": "alumno1@demo.com", "password": "alumno123"},
    )
    token = login.json()["token"]
    user_id = login.json()["usuario"]["id"]

    signs = client.get("/api/senas").json()
    sign_id = signs[0]["id"]

    progress = client.post(
        "/api/progreso/registrar",
        json={"usuario_id": user_id, "sena_id": sign_id, "puntuacion": 87},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert progress.status_code == 200
    assert progress.json()["mejorPuntuacion"] == 87
