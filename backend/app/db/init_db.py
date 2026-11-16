import logging
from datetime import date, time, datetime, timezone
from app.db.session import engine, Base, SessionLocal
from app.models import User, EventSession, Quiz, Question
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)


def init_db():
    """Create all tables and seed initial administrator and benchmark sessions."""
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Seed Default Administrator if not exists
        admin = db.query(User).filter(User.email == "admin@visionfusion.ieee.lk").first()
        if not admin:
            admin = User(
                full_name="Vision Fusion Admin",
                email="admin@visionfusion.ieee.lk",
                password_hash=get_password_hash("Admin@VF2026!"),
                university="Uva Wellassa University",
                student_id="ADMIN001",
                role="ADMIN",
                character_stage="The Vanguard",
                total_xp=1000,
            )
            db.add(admin)
            logger.info("Admin account seeded: admin@visionfusion.ieee.lk")

        # Seed Active Demo Student if not exists
        student = db.query(User).filter(User.email == "tharushagimhan01@gmail.com").first()
        if not student:
            student = User(
                full_name="Tharusha Gimhan",
                email="tharushagimhan01@gmail.com",
                password_hash=get_password_hash("Password123!"),
                university="Uva Wellassa University",
                student_id="UWU/CST/20/001",
                role="STUDENT",
                character_stage="The Intelligence Operative",
                total_xp=420,
            )
            db.add(student)
            logger.info("Demo student seeded: tharushagimhan01@gmail.com")

        # 2. Seed Default Benchmark Event Sessions if none exist
        if db.query(EventSession).count() == 0:
            sessions_data = [
                {
                    "title": "ITERA - Mock Interview Drive",
                    "description": "A physical mock interview program where students practise technical and HR interviews with industry professionals and receive personalized feedback to improve their interview skills and confidence.",
                    "session_type": "PHYSICAL",
                    "session_date": date(2026, 12, 10),
                    "start_time": time(9, 0),
                    "end_time": time(13, 0),
                    "venue": "Main Auditorium & Career Labs, Uva Wellassa University",
                    "xp_reward": 30,
                },
                {
                    "title": "TechCareerX - Software Commercialization and Standards",
                    "description": "An online workshop that guides students on software engineering standards, clean architecture, licensing, intellectual property, deployment, and turning student projects into commercially viable products.",
                    "session_type": "ONLINE",
                    "session_date": date(2026, 12, 11),
                    "start_time": time(14, 0),
                    "end_time": time(16, 30),
                    "meeting_url": "https://meet.google.com/visionfusion-techcareerx",
                    "joining_instructions": "Online session via Google Meet. Join using your registered student email.",
                    "xp_reward": 30,
                },
                {
                    "title": "Futurista - Future of IT",
                    "description": "An online industry-awareness session exploring emerging technologies, future IT trends, career opportunities, and the technical and professional skills needed for future careers.",
                    "session_type": "ONLINE",
                    "session_date": date(2026, 12, 12),
                    "start_time": time(10, 0),
                    "end_time": time(12, 30),
                    "meeting_url": "https://meet.google.com/visionfusion-futurista",
                    "joining_instructions": "Online session via Google Meet. Please keep microphones muted upon joining.",
                    "xp_reward": 30,
                },
                {
                    "title": "BugHunt - AI for University Life and Industry",
                    "description": "An interactive workshop demonstrating how AI tools can support academic learning, research, assignments, presentations, and workplace productivity while promoting responsible AI usage.",
                    "session_type": "PHYSICAL",
                    "session_date": date(2026, 12, 13),
                    "start_time": time(14, 0),
                    "end_time": time(16, 30),
                    "venue": "Computer Center / Main Lab, Uva Wellassa University",
                    "xp_reward": 30,
                },
                {
                    "title": "Road to Role - IT Career Pathway Discussions",
                    "description": "A physical career guidance event where IT professionals explain different job roles, required skills, career progression, and industry expectations to help students plan their future careers.",
                    "session_type": "PHYSICAL",
                    "session_date": date(2026, 12, 14),
                    "start_time": time(9, 30),
                    "end_time": time(12, 30),
                    "venue": "Faculty Complex Hall A, Uva Wellassa University",
                    "xp_reward": 30,
                },
            ]
            for s_info in sessions_data:
                db.add(EventSession(**s_info))
            logger.info("5 Official Vision Fusion 2.0 IT sessions seeded.")

        # 3. Seed Default Benchmark Quiz if none exist
        if db.query(Quiz).count() == 0:
            first_session = db.query(EventSession).first()
            quiz = Quiz(
                session_id=first_session.id if first_session else None,
                title="AI & Modern Tech Foundations Quiz",
                description="Test your understanding of modern AI paradigms, full-stack principles, and tech career essentials.",
                xp_reward=100,
                pass_percentage=60,
                allow_retakes=False,
                max_attempts=1,
                is_active=True,
            )
            db.add(quiz)
            db.flush()

            questions_data = [
                {
                    "quiz_id": quiz.id,
                    "question_text": "What does ACID stand for in relational database management systems?",
                    "options": [
                        "Atomicity, Consistency, Isolation, Durability",
                        "Async, Concurrency, Integration, Delivery",
                        "Array, Cache, Index, Document",
                        "Authentication, Cryptography, Identity, Directory"
                    ],
                    "correct_option_index": 0,
                    "order_index": 1,
                },
                {
                    "quiz_id": quiz.id,
                    "question_text": "In modern web application design, what is the primary role of JWT tokens?",
                    "options": [
                        "To compile TypeScript to JavaScript",
                        "Stateless, digitally signed authentication between client and server",
                        "To serve static image files",
                        "To perform database migrations"
                    ],
                    "correct_option_index": 1,
                    "order_index": 2,
                },
                {
                    "quiz_id": quiz.id,
                    "question_text": "Which HTTP status code signifies a conflict, such as attempting duplicate participation registration?",
                    "options": [
                        "200 OK",
                        "404 Not Found",
                        "409 Conflict",
                        "500 Internal Server Error"
                    ],
                    "correct_option_index": 2,
                    "order_index": 3,
                },
            ]
            for q_info in questions_data:
                q = Question(
                    quiz_id=q_info["quiz_id"],
                    question_text=q_info["question_text"],
                    correct_option_index=q_info["correct_option_index"],
                    order_index=q_info["order_index"],
                )
                q.options = q_info["options"]
                db.add(q)
            logger.info("Benchmark quiz and questions seeded.")

        db.commit()
        logger.info("Database initialized successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db()

