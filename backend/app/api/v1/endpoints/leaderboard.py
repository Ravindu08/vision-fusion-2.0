from typing import Dict, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.attendance import Attendance
from app.models.quiz_attempt import QuizAttempt
from app.api.deps import get_optional_current_user
from app.core.config import settings
from app.core.gamification_config import calculate_character_stage
from app.schemas.leaderboard import LeaderboardEntry, LeaderboardResponse

router = APIRouter()


@router.get("", response_model=LeaderboardResponse)
def get_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    search: Optional[str] = Query(None, max_length=100),
    stage: Optional[str] = Query(None, max_length=50),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Public leaderboard showing ranked active student participants.
    - Never exposes private fields like emails or student IDs.
    - Always returns the authenticated student's true global rank in `current_user_entry`.
    """
    # Query all active student participants ordered deterministically
    students = (
        db.query(User)
        .filter(User.role == "STUDENT", User.is_active == True)
        .order_by(User.total_xp.desc(), User.created_at.asc(), User.full_name.asc())
        .all()
    )

    # Aggregate attendance counts in one query
    attendance_rows = (
        db.query(Attendance.user_id, func.count(Attendance.id))
        .group_by(Attendance.user_id)
        .all()
    )
    attendance_counts: Dict[str, int] = {uid: count for uid, count in attendance_rows}

    # Aggregate distinct completed quiz counts in one query
    quiz_rows = (
        db.query(QuizAttempt.user_id, func.count(func.distinct(QuizAttempt.quiz_id)))
        .group_by(QuizAttempt.user_id)
        .all()
    )
    quiz_counts: Dict[str, int] = {uid: count for uid, count in quiz_rows}

    total_possible = settings.TOTAL_POSSIBLE_XP
    cert_threshold_xp = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * total_possible)

    ranked_entries = []
    current_user_entry: Optional[LeaderboardEntry] = None

    for idx, student in enumerate(students, start=1):
        progression = calculate_character_stage(student.total_xp, total_possible)
        is_me = bool(current_user and current_user.id == student.id)

        entry = LeaderboardEntry(
            rank=idx,
            user_id=student.id,
            full_name=student.full_name,
            university=student.university or "Uva Wellassa University",
            total_xp=student.total_xp,
            character_stage=progression["title"],
            stage_slug=progression["stage_slug"],
            overall_percent=progression["overall_percent"],
            sessions_attended=attendance_counts.get(student.id, 0),
            quizzes_completed=quiz_counts.get(student.id, 0),
            certificate_unlocked=student.total_xp >= cert_threshold_xp,
            is_current_user=is_me,
        )
        ranked_entries.append(entry)

        if is_me:
            current_user_entry = entry

    # Apply optional search and stage filters without altering global ranks
    filtered = ranked_entries
    if search and search.strip():
        q = search.strip().lower()
        filtered = [
            e for e in filtered
            if q in e.full_name.lower() or q in e.university.lower()
        ]

    if stage and stage.strip() and stage.strip().lower() != "all":
        s_slug = stage.strip().lower()
        filtered = [e for e in filtered if e.stage_slug == s_slug]

    return LeaderboardResponse(
        total_participants=len(students),
        total_possible_xp=total_possible,
        certificate_threshold_xp=cert_threshold_xp,
        entries=filtered[:limit],
        current_user_entry=current_user_entry,
    )

