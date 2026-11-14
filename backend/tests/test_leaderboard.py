import uuid
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_leaderboard_public_access_ranking_and_privacy(client):
    uid1 = uuid.uuid4().hex[:8]
    uid2 = uuid.uuid4().hex[:8]
    email1 = f"lb_top_{uid1}@uwu.ac.lk"
    email2 = f"lb_mid_{uid2}@uwu.ac.lk"

    created_ids = []
    try:
        # Register two test students
        r1 = client.post("/api/v1/auth/register", json={
            "full_name": f"LB Top Operative {uid1}",
            "email": email1,
            "password": "Password123!",
            "university": "Uva Wellassa University",
            "student_id": f"CST/22/{uid1[:3]}"
        })
        assert r1.status_code == 201
        user1_id = r1.json()["user"]["id"]
        created_ids.append(user1_id)

        r2 = client.post("/api/v1/auth/register", json={
            "full_name": f"LB Mid Operative {uid2}",
            "email": email2,
            "password": "Password123!",
            "university": "University of Moratuwa",
            "student_id": f"ENG/22/{uid2[:3]}"
        })
        assert r2.status_code == 201
        token2 = r2.json()["access_token"]
        user2_id = r2.json()["user"]["id"]
        created_ids.append(user2_id)

        # Assign deterministic high XP so ordering can be verified cleanly
        db = SessionLocal()
        u1 = db.query(User).filter(User.id == user1_id).first()
        u2 = db.query(User).filter(User.id == user2_id).first()
        u1.total_xp = 995
        u1.character_stage = "The Vanguard"
        u2.total_xp = 960
        u2.character_stage = "The Vanguard"
        db.commit()
        db.close()

        # 1. Public request (no auth)
        res_public = client.get("/api/v1/leaderboard")
        assert res_public.status_code == 200
        data_public = res_public.json()
        assert data_public["current_user_entry"] is None
        assert data_public["total_participants"] >= 2

        entries = data_public["entries"]
        assert len(entries) >= 2
        # Verify strictly descending XP order
        xps = [e["total_xp"] for e in entries]
        assert xps == sorted(xps, reverse=True)

        # Verify no private fields (email/student_id) leaked
        for entry in entries:
            assert "email" not in entry
            assert "student_id" not in entry
            assert "password_hash" not in entry

        # Top entry should be u1 ahead of u2
        pos1 = next(i for i, e in enumerate(entries) if e["user_id"] == user1_id)
        pos2 = next(i for i, e in enumerate(entries) if e["user_id"] == user2_id)
        assert pos1 < pos2

        # 2. Authenticated request with restrictive search -> current_user_entry still reflects global rank
        res_auth = client.get(
            f"/api/v1/leaderboard?search=LB Top Operative {uid1}",
            headers={"Authorization": f"Bearer {token2}"}
        )
        assert res_auth.status_code == 200
        data_auth = res_auth.json()
        assert len(data_auth["entries"]) == 1
        assert data_auth["entries"][0]["user_id"] == user1_id
        assert data_auth["current_user_entry"] is not None
        assert data_auth["current_user_entry"]["user_id"] == user2_id
        assert data_auth["current_user_entry"]["is_current_user"] is True
        assert data_auth["current_user_entry"]["rank"] > data_auth["entries"][0]["rank"]

        # 3. Admin users must not appear in student leaderboard
        db = SessionLocal()
        admin_emails = [u.id for u in db.query(User).filter(User.role == "ADMIN").all()]
        db.close()
        returned_ids = {e["user_id"] for e in entries}
        for aid in admin_emails:
            assert aid not in returned_ids
    finally:
        if created_ids:
            db = SessionLocal()
            db.query(User).filter(User.id.in_(created_ids)).delete(synchronize_session=False)
            db.commit()
            db.close()

