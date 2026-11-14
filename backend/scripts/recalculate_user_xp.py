import logging
from app.db.session import SessionLocal
from app.models.user import User
from app.models.session import EventSession
from app.models.attendance import Attendance
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.xp_transaction import XPTransaction
from app.core.gamification_config import calculate_character_stage
from app.core.config import settings
from sqlalchemy import func

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def sync_and_recalculate_xp():
    db = SessionLocal()
    try:
        # Active sessions & quizzes
        official_sessions = db.query(EventSession).all()
        official_session_ids = {s.id for s in official_sessions}
        official_quizzes = db.query(Quiz).all()
        official_quiz_ids = {q.id for q in official_quizzes}

        logger.info(f"Official Sessions: {len(official_sessions)} | Official Quizzes: {len(official_quizzes)}")

        # Clean orphan attendances (for sessions that don't exist anymore)
        orphan_atts = db.query(Attendance).filter(~Attendance.session_id.in_(official_session_ids)).all()
        if orphan_atts:
            logger.info(f"Removing {len(orphan_atts)} orphan attendance records...")
            for a in orphan_atts:
                db.delete(a)

        # Clean orphan quiz attempts (for quizzes that don't exist anymore)
        orphan_attempts = db.query(QuizAttempt).filter(~QuizAttempt.quiz_id.in_(official_quiz_ids)).all()
        if orphan_attempts:
            logger.info(f"Removing {len(orphan_attempts)} orphan quiz attempt records...")
            for att in orphan_attempts:
                db.delete(att)

        # Clean orphan XP transactions (for non-existent sessions/quizzes)
        all_valid_ref_ids = official_session_ids.union(official_quiz_ids)
        orphan_txs = db.query(XPTransaction).filter(~XPTransaction.reference_id.in_(all_valid_ref_ids)).all()
        if orphan_txs:
            logger.info(f"Removing {len(orphan_txs)} orphan XP transactions...")
            for tx in orphan_txs:
                db.delete(tx)

        db.flush()

        # Recalculate true XP for all students
        students = db.query(User).filter(User.role == "STUDENT").all()
        for s in students:
            # 1. Total Attendance XP across official sessions
            att_xp = (
                db.query(func.coalesce(func.sum(Attendance.xp_awarded), 0))
                .filter(Attendance.user_id == s.id, Attendance.session_id.in_(official_session_ids))
                .scalar()
                or 0
            )

            # 2. Total Quiz XP (best score per official quiz)
            quiz_xp = 0
            for q in official_quizzes:
                best = (
                    db.query(func.max(QuizAttempt.xp_awarded))
                    .filter(QuizAttempt.user_id == s.id, QuizAttempt.quiz_id == q.id)
                    .scalar()
                    or 0
                )
                quiz_xp += best

            true_total_xp = att_xp + quiz_xp
            old_xp = s.total_xp
            s.total_xp = true_total_xp

            # Recalculate Character Stage
            stage_info = calculate_character_stage(
                current_xp=true_total_xp,
                total_possible_xp=settings.TOTAL_POSSIBLE_XP
            )
            s.character_stage = stage_info["current_stage"].value

            logger.info(
                f"Student: {s.full_name} ({s.email}) | "
                f"Previous XP: {old_xp} -> True Total XP: {true_total_xp} "
                f"(Attendance: {att_xp} XP, Quizzes: {quiz_xp} XP) | "
                f"Stage: {s.character_stage} | Cert Eligible: {stage_info['is_certificate_eligible']}"
            )

        db.commit()
        logger.info("XP audit and synchronization completed successfully!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error during XP recalculation: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    sync_and_recalculate_xp()
