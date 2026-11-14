import pytest
import uuid
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import SessionLocal
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.quiz_attempt import QuizAttempt
from app.models.user import User


@pytest.fixture
def client():
    return TestClient(app)


def test_quiz_listing_and_anti_cheat(client):
    db = SessionLocal()
    quiz = db.query(Quiz).first()
    assert quiz is not None, "Benchmark quiz should exist."
    quiz_id = quiz.id
    db.close()

    # 1. Test public quiz list
    res = client.get("/api/v1/quizzes")
    assert res.status_code == 200
    quizzes = res.json()
    assert len(quizzes) >= 1
    target = next((q for q in quizzes if q["id"] == quiz_id), None)
    assert target is not None
    assert target["xp_reward"] == 100

    # 2. Test detailed quiz questions - ANTI-CHEAT CHECK
    detail_res = client.get(f"/api/v1/quizzes/{quiz_id}")
    assert detail_res.status_code == 200
    detail = detail_res.json()
    assert len(detail["questions"]) >= 3
    for q in detail["questions"]:
        # Verify that correct_option_index is NOT leaked anywhere in the API
        assert "correct_option_index" not in q
        assert len(q["options"]) == 4


def test_quiz_submission_and_xp_award(client):
    db = SessionLocal()
    quiz = db.query(Quiz).first()
    quiz_id = quiz.id
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    # Correct answer mapping for this quiz
    correct_answers = {q.id: q.correct_option_index for q in questions}
    quiz_xp = quiz.xp_reward
    db.close()

    # Register test student
    test_email = f"quizzer_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Quiz Master Student",
        "email": test_email,
        "password": "Password123!",
        "university": "Uva Wellassa University"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit with 100% correct answers
    submit_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": correct_answers},
        headers=headers
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["passed"] is True
    assert result["score"] == len(questions)
    assert result["percentage"] == 100.0
    assert result["xp_awarded"] == quiz_xp
    assert result["new_total_xp"] == quiz_xp

    # Attempt second submission when retakes disallowed (must fail with 409 Conflict)
    dup_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": correct_answers},
        headers=headers
    )
    assert dup_res.status_code == 409
    assert "already completed" in dup_res.json()["detail"]


def test_quiz_failing_submission_no_xp(client):
    db = SessionLocal()
    quiz = db.query(Quiz).first()
    quiz_id = quiz.id
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    # Intentionally submit incorrect answers
    wrong_answers = {q.id: (q.correct_option_index + 1) % 4 for q in questions}
    db.close()

    test_email = f"failing_student_{uuid.uuid4().hex[:8]}@uwu.ac.lk"
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Struggling Student",
        "email": test_email,
        "password": "Password123!",
        "university": "Uva Wellassa University"
    })
    token = reg_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    submit_res = client.post(
        f"/api/v1/quizzes/{quiz_id}/submit",
        json={"answers": wrong_answers},
        headers=headers
    )
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert result["passed"] is False
    assert result["xp_awarded"] == 0
    assert result["new_total_xp"] == 0

