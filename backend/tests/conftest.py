import pytest
from app.db.session import SessionLocal
from app.models.user import User

TEST_PREFIXES = (
    "student_",
    "duplicate_",
    "login_",
    "me_test_",
    "cert_student_",
    "quizzer_",
    "failing_student_",
    "attendee_",
    "invalid_pw_",
    "test_reg_",
    "lb_top_",
    "lb_mid_",
)


def _cleanup_test_records():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        for u in users:
            if any(u.email.lower().startswith(p) for p in TEST_PREFIXES):
                db.delete(u)
        db.commit()
    finally:
        db.close()


@pytest.fixture(autouse=True, scope="session")
def auto_cleanup_test_database():
    """Clean up any leftover test users before and after test sessions."""
    _cleanup_test_records()
    yield
    _cleanup_test_records()

