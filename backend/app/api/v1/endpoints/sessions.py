from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.session import EventSession
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.session import SessionRead
from app.core.security import decode_access_token
from app.core.config import settings

router = APIRouter()
oauth2_optional_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False
)


def get_optional_user(
    token: Optional[str] = Depends(oauth2_optional_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Extract user if valid token present, otherwise return None."""
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload:
        return None
    user_id = payload.get("sub")
    if not user_id:
        return None
    return db.query(User).filter(User.id == user_id, User.is_active == True).first()


@router.get("", response_model=List[SessionRead])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve all active event sessions ordered by date and time."""
    sessions = (
        db.query(EventSession)
        .filter(EventSession.is_active == True)
        .order_by(EventSession.session_date.asc(), EventSession.start_time.asc())
        .all()
    )

    # If authenticated, fetch user's attendance records to flag has_participated
    user_attendance = {}
    if current_user:
        attendances = (
            db.query(Attendance)
            .filter(Attendance.user_id == current_user.id)
            .all()
        )
        user_attendance = {att.session_id: att.declared_at for att in attendances}

    results = []
    for s in sessions:
        s_dict = {
            "id": s.id,
            "title": s.title,
            "description": s.description,
            "session_type": s.session_type,
            "session_date": s.session_date,
            "start_time": s.start_time,
            "end_time": s.end_time,
            "venue": s.venue,
            "meeting_url": s.meeting_url,
            "joining_instructions": s.joining_instructions,
            "xp_reward": s.xp_reward,
            "is_active": s.is_active,
            "created_at": s.created_at,
            "has_participated": s.id in user_attendance,
            "declared_at": user_attendance.get(s.id),
        }
        results.append(s_dict)

    return results


@router.get("/{session_id}", response_model=SessionRead)
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """Retrieve details for a single event session."""
    session_obj = db.query(EventSession).filter(EventSession.id == session_id).first()
    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )

    has_participated = False
    declared_at = None
    if current_user:
        att = (
            db.query(Attendance)
            .filter(Attendance.user_id == current_user.id, Attendance.session_id == session_id)
            .first()
        )
        if att:
            has_participated = True
            declared_at = att.declared_at

    return {
        "id": session_obj.id,
        "title": session_obj.title,
        "description": session_obj.description,
        "session_type": session_obj.session_type,
        "session_date": session_obj.session_date,
        "start_time": session_obj.start_time,
        "end_time": session_obj.end_time,
        "venue": session_obj.venue,
        "meeting_url": session_obj.meeting_url,
        "joining_instructions": session_obj.joining_instructions,
        "xp_reward": session_obj.xp_reward,
        "is_active": session_obj.is_active,
        "created_at": session_obj.created_at,
        "has_participated": has_participated,
        "declared_at": declared_at,
    }

