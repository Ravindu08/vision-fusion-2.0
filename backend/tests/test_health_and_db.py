import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models import User, EventSession, Quiz
from app.core.gamification_config import calculate_character_stage, CharacterStage


@pytest.fixture
def client():
    return TestClient(app)


def test_root_and_health(client):
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Vision Fusion 2.0" in data["project"]

    health_resp = client.get("/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] == "healthy"


def test_database_seeded_entities():
    db = SessionLocal()
    try:
        # Check admin user
        admin = db.query(User).filter(User.email == "admin@visionfusion.ieee.lk").first()
        assert admin is not None
        assert admin.role == "ADMIN"
        assert admin.character_stage == "The Vanguard"

        # Check sessions
        session_count = db.query(EventSession).count()
        assert session_count >= 5

        # Check quiz
        quiz = db.query(Quiz).first()
        assert quiz is not None
        assert quiz.xp_reward == 70
    finally:
        db.close()


def test_character_stage_evolution_math():
    # 0 XP -> The Recruit (0%)
    res_0 = calculate_character_stage(0, 500)
    assert res_0["current_stage"] == CharacterStage.THE_RECRUIT
    assert res_0["is_certificate_eligible"] is False
    assert res_0["xp_to_next_stage"] == 100

    # 150 XP -> The Builder (30%)
    res_150 = calculate_character_stage(150, 500)
    assert res_150["current_stage"] == CharacterStage.THE_BUILDER
    assert res_150["is_certificate_eligible"] is False
    assert res_150["xp_to_next_stage"] == 50  # 200 - 150

    # 250 XP -> The Pathfinder (50%)
    res_250 = calculate_character_stage(250, 500)
    assert res_250["current_stage"] == CharacterStage.THE_PATHFINDER
    assert res_250["is_certificate_eligible"] is False
    assert res_250["xp_to_next_stage"] == 100  # 350 - 250

    # 350 XP -> The Intelligence Operative (70%) -> Cert Eligible!
    res_350 = calculate_character_stage(350, 500)
    assert res_350["current_stage"] == CharacterStage.THE_INTELLIGENCE_OPERATIVE
    assert res_350["is_certificate_eligible"] is True
    assert res_350["xp_to_next_stage"] == 100  # 450 - 350

    # 460 XP -> The Vanguard (92%)
    res_460 = calculate_character_stage(460, 500)
    assert res_460["current_stage"] == CharacterStage.THE_VANGUARD
    assert res_460["next_stage"] is None

