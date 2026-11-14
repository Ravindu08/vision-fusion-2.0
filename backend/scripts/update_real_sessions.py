import logging
from datetime import date, time
from app.db.session import SessionLocal
from app.models.session import EventSession

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

OFFICIAL_EVENTS = [
    {
        "title": "ITERA - Mock Interview Drive",
        "description": "A physical mock interview program where students practise technical and HR interviews with industry professionals and receive personalized feedback to improve their interview skills and confidence.",
        "session_type": "PHYSICAL",
        "session_date": date(2026, 12, 10),
        "start_time": time(9, 0),
        "end_time": time(13, 0),
        "venue": "Main Auditorium & Career Labs, Uva Wellassa University",
        "meeting_url": None,
        "joining_instructions": "Please arrive on time with a printed copy of your updated CV / Resume.",
        "xp_reward": 30,
    },
    {
        "title": "TechCareerX - Software Commercialization and Standards",
        "description": "An online workshop that guides students on software engineering standards, clean architecture, licensing, intellectual property, deployment, and turning student projects into commercially viable products.",
        "session_type": "ONLINE",
        "session_date": date(2026, 12, 11),
        "start_time": time(14, 0),
        "end_time": time(16, 30),
        "venue": None,
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
        "venue": None,
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
        "meeting_url": None,
        "joining_instructions": "Hands-on interactive workshop. Bring your university laptops or utilize lab terminals.",
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
        "meeting_url": None,
        "joining_instructions": "Open to all undergraduates. Interactive Q&A with industry guest speakers.",
        "xp_reward": 30,
    },
]

def update_sessions():
    db = SessionLocal()
    try:
        existing_sessions = db.query(EventSession).order_by(EventSession.session_date.asc(), EventSession.created_at.asc()).all()
        logger.info(f"Found {len(existing_sessions)} existing event sessions in database.")

        for i, new_data in enumerate(OFFICIAL_EVENTS):
            if i < len(existing_sessions):
                session = existing_sessions[i]
                logger.info(f"Updating session {i+1} [ID: {session.id}]: '{session.title}' -> '{new_data['title']}'")
                for key, val in new_data.items():
                    setattr(session, key, val)
            else:
                logger.info(f"Adding new session {i+1}: '{new_data['title']}'")
                session = EventSession(**new_data)
                db.add(session)

        db.commit()
        logger.info("Successfully updated all 5 official Vision Fusion 2.0 IT events in database!")

        # Verify
        updated = db.query(EventSession).order_by(EventSession.session_date.asc()).all()
        print("\n--- Current Verified Sessions in Database ---")
        for s in updated:
            mode_badge = f"[{s.session_type}]"
            loc = s.venue if s.session_type == "PHYSICAL" else s.meeting_url
            print(f"{s.session_date} {s.start_time.strftime('%H:%M')}-{s.end_time.strftime('%H:%M')} | {mode_badge:10} | {s.title} ({loc})")

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating sessions: {e}", exc_info=True)
        raise
    finally:
        db.close()

if __name__ == "__main__":
    update_sessions()
