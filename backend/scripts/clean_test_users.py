import logging
from app.db.session import SessionLocal
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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

def clean_database():
    db = SessionLocal()
    try:
        all_users = db.query(User).all()
        to_delete = []
        kept = []

        for u in all_users:
            is_test = any(u.email.lower().startswith(p) for p in TEST_PREFIXES)
            if is_test:
                to_delete.append(u)
            else:
                kept.append(u)

        logger.info(f"Total users found: {len(all_users)}")
        logger.info(f"Test users to remove: {len(to_delete)}")
        logger.info(f"Real users to keep: {len(kept)}")

        for u in to_delete:
            db.delete(u)

        db.commit()
        logger.info("Successfully cleaned all duplicate test users from database!")

        remaining = db.query(User).all()
        print("\n--- Remaining Active Users in Database ---")
        for u in remaining:
            print(f"- {u.full_name} ({u.email}) | Role: {u.role} | Stage: {u.character_stage} | XP: {u.total_xp}")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during cleanup: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    clean_database()

