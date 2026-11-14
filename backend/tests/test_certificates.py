import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_certificate_eligibility_and_pdf_generation(client):
    test_email = f"cert_student_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Nipuna Sandaruwan",
        "email": test_email,
        "password": "Password123!",
        "university": "Uva Wellassa University",
        "student_id": "CST/22/099"
    })
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. At 0 XP -> Not eligible
    status_res = client.get("/api/v1/certificates/status", headers=headers)
    assert status_res.status_code == 200
    assert status_res.json()["is_eligible"] is False

    # 2. Try download -> Rejected with 403 Forbidden
    dl_res = client.get("/api/v1/certificates/download", headers=headers)
    assert dl_res.status_code == 403

    # 3. Simulate XP accumulation >= 350 XP
    db = SessionLocal()
    user = db.query(User).filter(User.id == user_id).first()
    user.total_xp = 420
    user.character_stage = "The Pathfinder"
    db.commit()
    db.close()

    # 4. Re-check status -> Eligible!
    status_res2 = client.get("/api/v1/certificates/status", headers=headers)
    assert status_res2.status_code == 200
    assert status_res2.json()["is_eligible"] is True

    # 5. Claim certificate
    claim_res = client.post("/api/v1/certificates/claim", headers=headers)
    assert claim_res.status_code == 200
    assert "VF2-2026-" in claim_res.json()["certificate_id"]

    # 6. Download PDF Certificate
    dl_res2 = client.get("/api/v1/certificates/download", headers=headers)
    assert dl_res2.status_code == 200
    assert dl_res2.headers["content-type"] == "application/pdf"
    assert len(dl_res2.content) > 1000  # Valid binary PDF bytes

