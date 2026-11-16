import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_admin_endpoints_permission_and_crud(client):
    # 1. Login as Admin
    admin_login = client.post("/api/v1/auth/login", json={
        "email": "admin@visionfusion.ieee.lk",
        "password": "Admin@VF2026!"
    })
    assert admin_login.status_code == 200
    admin_token = admin_login.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 2. Register a student
    s_email = f"student_adm_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    s_reg = client.post("/api/v1/auth/register", json={
        "full_name": "Admin Test Student",
        "email": s_email,
        "password": "Password123!",
        "university": "Uva Wellassa University",
        "student_id": "ADM/22/01"
    })
    assert s_reg.status_code == 201
    student_id = s_reg.json()["user"]["id"]
    student_token = s_reg.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    try:
        # 3. Unauthenticated access -> 401
        res = client.get("/api/v1/admin/stats")
        assert res.status_code == 401

        # 4. Student access -> 403 Forbidden
        res = client.get("/api/v1/admin/stats", headers=student_headers)
        assert res.status_code == 403

        # 5. Admin access stats -> 200 OK
        res = client.get("/api/v1/admin/stats", headers=admin_headers)
        assert res.status_code == 200
        stats = res.json()
        assert stats["total_students"] >= 1
        assert stats["total_sessions"] >= 5

        # 5b. Admin create student directly
        new_adm_student_email = f"direct_adm_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
        res = client.post(
            "/api/v1/admin/users",
            json={
                "full_name": "Direct Admin Enrolled",
                "email": new_adm_student_email,
                "password": "Password123!",
                "university": "Uva Wellassa University",
                "student_id": "ADM/DIRECT/01",
                "total_xp": 100,
            },
            headers=admin_headers,
        )
        assert res.status_code == 201
        created_adm_student = res.json()
        assert created_adm_student["full_name"] == "Direct Admin Enrolled"
        assert created_adm_student["total_xp"] == 100
        # Cleanup created student
        client.delete(f"/api/v1/admin/users/{created_adm_student['id']}", headers=admin_headers)

        # 6. Admin list students
        res = client.get("/api/v1/admin/users", headers=admin_headers)
        assert res.status_code == 200
        data = res.json()
        assert data["total"] >= 1
        target = next((u for u in data["users"] if u["id"] == student_id), None)
        assert target is not None
        assert target["full_name"] == "Admin Test Student"

        # 7. Admin update student (adjust XP to 400 -> should auto-evolve to The Intelligence Operative)
        res = client.put(
            f"/api/v1/admin/users/{student_id}",
            json={"total_xp": 400, "full_name": "Admin Test Student Updated"},
            headers=admin_headers
        )
        assert res.status_code == 200
        updated = res.json()
        assert updated["full_name"] == "Admin Test Student Updated"
        assert updated["total_xp"] == 400
        assert updated["character_stage"] == "The Intelligence Operative"
        assert updated["certificate_eligible"] is True

        # 8. Export CSV
        res = client.get("/api/v1/admin/export/csv", headers=admin_headers)
        assert res.status_code == 200
        assert "text/csv" in res.headers["content-type"]
        assert "Student ID,Full Name,Email" in res.text

        # 9. Admin cannot delete self
        admin_id = admin_login.json()["user"]["id"]
        res = client.delete(f"/api/v1/admin/users/{admin_id}", headers=admin_headers)
        assert res.status_code == 400

        # 10. Admin delete student -> 200 OK
        res = client.delete(f"/api/v1/admin/users/{student_id}", headers=admin_headers)
        assert res.status_code == 200
        assert res.json()["success"] is True

        # Confirm deleted
        res = client.get(f"/api/v1/admin/users?search={s_email}", headers=admin_headers)
        assert res.json()["total"] == 0
    finally:
        # Ensure cleanup in case of test failure
        db = SessionLocal()
        db.query(User).filter(User.id == student_id).delete()
        db.commit()
        db.close()

