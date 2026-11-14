import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_student_registration_success(client):
    test_email = f"student_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    payload = {
        "full_name": "Kasun Perera",
        "email": test_email,
        "password": "SecurePassword123!",
        "university": "Uva Wellassa University",
        "student_id": "CST/22/045"
    }

    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_email.lower()
    assert data["user"]["role"] == "STUDENT"
    assert data["user"]["character_stage"] == "The Recruit"
    assert data["user"]["total_xp"] == 0


def test_registration_duplicate_email(client):
    test_email = f"duplicate_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    payload = {
        "full_name": "Anuki Silva",
        "email": test_email,
        "password": "Password123!",
    }

    # First registration
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Second registration with identical email
    res2 = client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]


def test_login_success(client):
    test_email = f"login_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    password = "MyStrongPassword@2026"
    client.post("/api/v1/auth/register", json={
        "full_name": "Nimal Fernando",
        "email": test_email,
        "password": password
    })

    # Perform login
    response = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": password
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == test_email


def test_login_invalid_password(client):
    test_email = f"invalid_pw_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    client.post("/api/v1/auth/register", json={
        "full_name": "Test User",
        "email": test_email,
        "password": "CorrectPassword123!"
    })

    response = client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "WrongPassword999!"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_admin_login(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@visionfusion.ieee.lk",
        "password": "Admin@VF2026!"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["user"]["role"] == "ADMIN"
    assert data["user"]["character_stage"] == "The Vanguard"


def test_get_current_user_me(client):
    test_email = f"me_test_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Dinuka Jayawardena",
        "email": test_email,
        "password": "TestPassword123!"
    })
    token = reg_res.json()["access_token"]

    # Call /api/v1/auth/me with Bearer token
    me_res = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert me_res.status_code == 200
    user_data = me_res.json()
    assert user_data["email"] == test_email
    assert user_data["character_stage"] == "The Recruit"
    assert user_data["stage_slug"] == "recruit"
    assert user_data["is_certificate_eligible"] is False
    assert user_data["xp_to_next_stage"] == 100


def test_get_me_unauthorized(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

