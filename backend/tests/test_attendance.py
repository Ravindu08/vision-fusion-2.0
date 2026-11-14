import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.session import EventSession
from app.models.attendance import Attendance
from app.models.xp_transaction import XPTransaction
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_event_participation_lifecycle(client):
    db = SessionLocal()
    # 1. Fetch an active session
    session = db.query(EventSession).first()
    assert session is not None, "At least one session should be seeded."
    session_id = session.id
    session_xp = session.xp_reward
    db.close()

    # 2. Register a new test student
    test_email = f"attendee_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Test Attendee",
        "email": test_email,
        "password": "Password123!",
        "university": "Uva Wellassa University"
    })
    assert reg_res.status_code == 201
    token = reg_res.json()["access_token"]
    user_id = reg_res.json()["user"]["id"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Declare participation for the first time
    declare_res = client.post(f"/api/v1/attendance/{session_id}/declare", headers=headers)
    assert declare_res.status_code == 200
    data = declare_res.json()
    assert data["success"] is True
    assert data["xp_awarded"] == session_xp
    assert data["new_total_xp"] == session_xp
    assert data["session_id"] == session_id

    # 4. Attempt to declare participation a SECOND time (Must fail with 409 Conflict)
    duplicate_res = client.post(f"/api/v1/attendance/{session_id}/declare", headers=headers)
    assert duplicate_res.status_code == 409
    assert "already declared participation" in duplicate_res.json()["detail"]

    # 5. Verify database integrity
    db = SessionLocal()
    try:
        # Check Attendance record
        att_record = db.query(Attendance).filter(
            Attendance.user_id == user_id,
            Attendance.session_id == session_id
        ).first()
        assert att_record is not None
        assert att_record.xp_awarded == session_xp

        # Check XPTransaction record
        xp_tx = db.query(XPTransaction).filter(
            XPTransaction.user_id == user_id,
            XPTransaction.reference_id == session_id,
            XPTransaction.source_type == "ATTENDANCE"
        ).first()
        assert xp_tx is not None
        assert xp_tx.amount == session_xp

        # Check user updated total_xp
        user = db.query(User).filter(User.id == user_id).first()
        assert user.total_xp == session_xp
    finally:
        db.close()

    # 6. Check /api/v1/attendance/my-records
    my_records_res = client.get("/api/v1/attendance/my-records", headers=headers)
    assert my_records_res.status_code == 200
    records = my_records_res.json()
    assert len(records) == 1
    assert records[0]["session_id"] == session_id


def test_unauthenticated_participation_rejected(client):
    db = SessionLocal()
    session = db.query(EventSession).first()
    session_id = session.id
    db.close()

    res = client.post(f"/api/v1/attendance/{session_id}/declare")
    assert res.status_code == 401

