from typing import List
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.models.user import User
from app.models.session import EventSession
from app.models.attendance import Attendance
from app.models.xp_transaction import XPTransaction
from app.schemas.attendance import AttendanceDeclareResponse, AttendanceRecord
from app.api.deps import get_current_user
from app.core.gamification_config import calculate_character_stage
from app.core.config import settings

router = APIRouter()


@router.post("/{session_id}/declare", response_model=AttendanceDeclareResponse, status_code=status.HTTP_200_OK)
def declare_participation(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student self-declared event participation endpoint.
    Guarantees ACID transaction:
    1. Verifies session exists and is active.
    2. Enforces strict idempotency and duplicate prevention.
    3. Records attendance, creates XP transaction, and updates user total XP.
    4. Evaluates character stage evolution automatically.
    """
    # 1. Reject administrator participation
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts cannot participate in student events or claim attendance XP.",
        )

    # 2. Fetch target event session
    session_obj = db.query(EventSession).filter(
        EventSession.id == session_id,
        EventSession.is_active == True
    ).first()

    if not session_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Event session not found or inactive."
        )

    # 2. Check if participation has already been claimed
    existing_attendance = db.query(Attendance).filter(
        Attendance.user_id == current_user.id,
        Attendance.session_id == session_id
    ).first()

    if existing_attendance:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already declared participation for '{session_obj.title}'. Participation can only be claimed once."
        )

    xp_to_award = session_obj.xp_reward
    now_utc = datetime.now(timezone.utc)

    try:
        # 3. Create Attendance Record
        attendance_record = Attendance(
            user_id=current_user.id,
            session_id=session_id,
            declared_at=now_utc,
            xp_awarded=xp_to_award,
        )
        db.add(attendance_record)

        # 4. Create XP Transaction Record
        xp_tx = XPTransaction(
            user_id=current_user.id,
            amount=xp_to_award,
            source_type="ATTENDANCE",
            reference_id=session_id,
            description=f"Self-declared participation: {session_obj.title}",
            created_at=now_utc,
        )
        db.add(xp_tx)

        # 5. Increment user total XP
        previous_stage = current_user.character_stage
        current_user.total_xp += xp_to_award

        # 6. Recalculate Character Evolution
        stage_info = calculate_character_stage(
            current_xp=current_user.total_xp,
            total_possible_xp=settings.TOTAL_POSSIBLE_XP
        )
        new_stage = stage_info["current_stage"]
        has_evolved = new_stage != previous_stage

        if has_evolved:
            current_user.character_stage = new_stage

        # Commit ACID transaction atomically
        db.commit()
        db.refresh(current_user)

    except IntegrityError:
        # Handled if concurrent click violates unique constraint uq_user_session_attendance
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Participation was already registered in a concurrent request."
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record participation: {str(e)}"
        )

    return {
        "success": True,
        "message": f"Participation recorded! +{xp_to_award} XP awarded.",
        "session_id": session_id,
        "session_title": session_obj.title,
        "xp_awarded": xp_to_award,
        "new_total_xp": current_user.total_xp,
        "character_stage": current_user.character_stage,
        "has_evolved": has_evolved,
        "declared_at": now_utc,
    }


@router.get("/my-records", response_model=List[AttendanceRecord])
def get_my_attendance_records(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve all participation records declared by the current authenticated student."""
    records = (
        db.query(Attendance, EventSession.title.label("session_title"))
        .join(EventSession, Attendance.session_id == EventSession.id)
        .filter(Attendance.user_id == current_user.id)
        .order_by(Attendance.declared_at.desc())
        .all()
    )

    results = []
    for att, session_title in records:
        results.append({
            "id": att.id,
            "session_id": att.session_id,
            "session_title": session_title,
            "xp_awarded": att.xp_awarded,
            "declared_at": att.declared_at,
        })
    return results

