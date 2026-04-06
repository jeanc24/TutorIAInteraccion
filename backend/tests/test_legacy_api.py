from __future__ import annotations


def test_admin_login(client):
    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@tutor.com", "password": "admin123"},
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert data["usuario"]["rol"] == "ADMIN"
    assert data["token"]


def test_signup_flow(client):
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
    assert login.status_code == 200
    assert login.json()["token"]
