from __future__ import annotations


def test_alphabet_catalog(client):
    response = client.get("/api/v2/alphabet")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 27
    assert len(data["letters"]) == 27

    letters = [l["letter"] for l in data["letters"]]
    assert "A" in letters
    assert "Z" in letters
    assert "Ñ" in letters


def test_alphabet_single_letter(client):
    response = client.get("/api/v2/alphabet/A")
    assert response.status_code == 200
    data = response.json()
    assert data["letter"] == "A"
    assert data["difficulty"] == "easy"
    assert data["gesture_type"] == "STATIC"
    assert data["finger_pattern"] is not None


def test_alphabet_letter_not_found(client):
    response = client.get("/api/v2/alphabet/1")
    assert response.status_code == 404


def test_progress_requires_auth(client):
    response = client.get("/api/v2/alphabet/progress/me")
    assert response.status_code == 401


def test_record_attempt_and_progress(client):
    client.post(
        "/api/auth/signup",
        json={"nombre": "Test User", "email": "test@test.com", "password": "test123"},
    )
    login = client.post(
        "/api/auth/login",
        json={"email": "test@test.com", "password": "test123"},
    )
    token = login.json()["token"]
    headers = {"Authorization": f"Bearer {token}"}

    attempt_response = client.post(
        "/api/v2/alphabet/progress/attempt",
        json={"letter": "A", "score": 0.92, "duration_ms": 3400, "completed": True, "mode": "practice"},
        headers=headers,
    )
    assert attempt_response.status_code == 200
    data = attempt_response.json()
    assert data["letter"] == "A"
    assert data["best_score"] == 0.92
    assert data["completed"] is True
    assert data["attempt_count"] == 1

    progress = client.get("/api/v2/alphabet/progress/me", headers=headers)
    assert progress.status_code == 200
    pdata = progress.json()
    assert pdata["total_completed"] >= 1
    assert pdata["total_letters"] == 27
    assert pdata["letters"]["A"]["completed"] is True


def test_health(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
