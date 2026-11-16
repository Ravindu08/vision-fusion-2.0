import io
import csv
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.models.session import EventSession
from app.models.attendance import Attendance
from app.models.quiz import Quiz
from app.models.quiz_attempt import QuizAttempt
from app.models.certificate import Certificate
from app.api.deps import get_current_admin
from app.core.config import settings
from app.core.security import get_password_hash
from app.core.gamification_config import calculate_character_stage
from app.schemas.admin import (
    AdminStats,
    AdminUserItem,
    AdminUserListResponse,
    AdminUserCreate,
    AdminUserUpdate,
)

router = APIRouter()


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Retrieve overarching platform metrics for administrators."""
    cert_threshold = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)

    total_students = db.query(User).filter(User.role == "STUDENT").count()
    total_sessions = db.query(EventSession).count()
    total_attendance = db.query(Attendance).count()
    total_quizzes = db.query(Quiz).count()
    total_quiz_attempts = db.query(QuizAttempt).count()
    total_certs_claimed = db.query(Certificate).count()
    total_certs_eligible = (
        db.query(User)
        .filter(User.role == "STUDENT", User.total_xp >= cert_threshold)
        .count()
    )

    return AdminStats(
        total_students=total_students,
        total_sessions=total_sessions,
        total_attendance_records=total_attendance,
        total_quizzes=total_quizzes,
        total_quiz_attempts=total_quiz_attempts,
        total_certificates_claimed=total_certs_claimed,
        total_certificates_eligible=total_certs_eligible,
    )


@router.get("/users", response_model=AdminUserListResponse)
def list_students(
    search: Optional[str] = Query(None, max_length=100),
    stage: Optional[str] = Query(None, max_length=50),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """List all registered students with full administrative details and activity metrics."""
    cert_threshold = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)

    query = db.query(User).filter(User.role == "STUDENT")

    if search and search.strip():
        q = f"%{search.strip().lower()}%"
        query = query.filter(
            func.lower(User.full_name).like(q)
            | func.lower(User.email).like(q)
            | func.lower(User.student_id).like(q)
            | func.lower(User.university).like(q)
        )

    if stage and stage.strip() and stage.strip().lower() != "all":
        query = query.filter(func.lower(User.character_stage) == stage.strip().lower())

    total_count = query.count()
    students = query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    # Pre-fetch counts for these students
    user_ids = [s.id for s in students]

    attendance_counts: Dict[str, int] = {}
    if user_ids:
        rows = (
            db.query(Attendance.user_id, func.count(Attendance.id))
            .filter(Attendance.user_id.in_(user_ids))
            .group_by(Attendance.user_id)
            .all()
        )
        attendance_counts = {uid: cnt for uid, cnt in rows}

    quiz_counts: Dict[str, int] = {}
    if user_ids:
        rows = (
            db.query(QuizAttempt.user_id, func.count(func.distinct(QuizAttempt.quiz_id)))
            .filter(QuizAttempt.user_id.in_(user_ids))
            .group_by(QuizAttempt.user_id)
            .all()
        )
        quiz_counts = {uid: cnt for uid, cnt in rows}

    claimed_cert_uids = set()
    if user_ids:
        rows = db.query(Certificate.user_id).filter(Certificate.user_id.in_(user_ids)).all()
        claimed_cert_uids = {uid for (uid,) in rows}

    items = []
    for s in students:
        items.append(
            AdminUserItem(
                id=s.id,
                full_name=s.full_name,
                email=s.email,
                university=s.university,
                student_id=s.student_id,
                role=s.role,
                total_xp=s.total_xp,
                character_stage=s.character_stage,
                is_active=s.is_active,
                created_at=s.created_at,
                sessions_attended=attendance_counts.get(s.id, 0),
                quizzes_completed=quiz_counts.get(s.id, 0),
                certificate_eligible=s.total_xp >= cert_threshold,
                certificate_claimed=s.id in claimed_cert_uids,
            )
        )

    return AdminUserListResponse(total=total_count, users=items)


@router.post("/users", response_model=AdminUserItem, status_code=status.HTTP_201_CREATED)
def create_student(
    student_in: AdminUserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Enroll a new student operative directly from the administrative dashboard."""
    existing_user = db.query(User).filter(func.lower(User.email) == student_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"An account with email '{student_in.email}' already exists.",
        )

    initial_xp = student_in.total_xp or 0
    progression = calculate_character_stage(initial_xp, settings.TOTAL_POSSIBLE_XP)
    stage_name = progression["current_stage"].value

    new_student = User(
        full_name=student_in.full_name.strip(),
        email=student_in.email.strip().lower(),
        password_hash=get_password_hash(student_in.password),
        university=student_in.university.strip() if student_in.university else "Uva Wellassa University",
        student_id=student_in.student_id.strip() if student_in.student_id else None,
        role="STUDENT",
        total_xp=initial_xp,
        character_stage=stage_name,
        is_active=True,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)

    cert_threshold = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    return AdminUserItem(
        id=new_student.id,
        full_name=new_student.full_name,
        email=new_student.email,
        university=new_student.university,
        student_id=new_student.student_id,
        role=new_student.role,
        total_xp=new_student.total_xp,
        character_stage=new_student.character_stage,
        is_active=new_student.is_active,
        created_at=new_student.created_at,
        sessions_attended=0,
        quizzes_completed=0,
        certificate_eligible=new_student.total_xp >= cert_threshold,
        certificate_claimed=False,
    )


@router.put("/users/{user_id}", response_model=AdminUserItem)
def update_student(
    user_id: str,
    update_data: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Update student profile, institutional identity, or adjust XP."""
    student = db.query(User).filter(User.id == user_id, User.role == "STUDENT").first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student not found or is an administrator.",
        )

    if update_data.full_name is not None:
        student.full_name = update_data.full_name.strip()
    if update_data.email is not None:
        target_email = update_data.email.strip().lower()
        if target_email != student.email:
            existing_email = db.query(User).filter(func.lower(User.email) == target_email).first()
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Email '{target_email}' is already in use by another user.",
                )
            student.email = target_email
    if update_data.password is not None and update_data.password.strip():
        student.password_hash = get_password_hash(update_data.password.strip())
    if update_data.student_id is not None:
        student.student_id = update_data.student_id.strip() if update_data.student_id else None
    if update_data.university is not None:
        student.university = update_data.university.strip()
    if update_data.is_active is not None:
        student.is_active = update_data.is_active

    if update_data.total_xp is not None:
        student.total_xp = update_data.total_xp
        # Recalculate stage automatically
        progression = calculate_character_stage(student.total_xp, settings.TOTAL_POSSIBLE_XP)
        student.character_stage = progression["current_stage"].value

    db.commit()
    db.refresh(student)

    # Fetch activity metrics
    cert_threshold = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    sessions_attended = db.query(Attendance).filter(Attendance.user_id == student.id).count()
    quizzes_completed = (
        db.query(func.count(func.distinct(QuizAttempt.quiz_id)))
        .filter(QuizAttempt.user_id == student.id)
        .scalar()
        or 0
    )
    has_cert = db.query(Certificate).filter(Certificate.user_id == student.id).first() is not None

    return AdminUserItem(
        id=student.id,
        full_name=student.full_name,
        email=student.email,
        university=student.university,
        student_id=student.student_id,
        role=student.role,
        total_xp=student.total_xp,
        character_stage=student.character_stage,
        is_active=student.is_active,
        created_at=student.created_at,
        sessions_attended=sessions_attended,
        quizzes_completed=quizzes_completed,
        certificate_eligible=student.total_xp >= cert_threshold,
        certificate_claimed=has_cert,
    )


@router.delete("/users/{user_id}")
def delete_student(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin),
):
    """Delete a student record or spam user from the database."""
    if user_id == current_admin.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own administrator account.",
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    if target_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete an administrator account.",
        )

    db.delete(target_user)
    db.commit()

    return {"success": True, "message": f"Student '{target_user.full_name}' was successfully removed."}


@router.get("/export/csv")
def export_students_csv(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    """Export complete student registry with verified metrics as CSV."""
    cert_threshold = int((settings.CERTIFICATE_THRESHOLD_PERCENT / 100.0) * settings.TOTAL_POSSIBLE_XP)
    students = (
        db.query(User)
        .filter(User.role == "STUDENT")
        .order_by(User.total_xp.desc(), User.full_name.asc())
        .all()
    )

    # Aggregates
    att_rows = (
        db.query(Attendance.user_id, func.count(Attendance.id))
        .group_by(Attendance.user_id)
        .all()
    )
    att_dict = {uid: cnt for uid, cnt in att_rows}

    quiz_rows = (
        db.query(QuizAttempt.user_id, func.count(func.distinct(QuizAttempt.quiz_id)))
        .group_by(QuizAttempt.user_id)
        .all()
    )
    quiz_dict = {uid: cnt for uid, cnt in quiz_rows}

    cert_rows = db.query(Certificate.user_id).all()
    cert_set = {uid for (uid,) in cert_rows}

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Student ID",
        "Full Name",
        "Email",
        "University",
        "Total XP",
        "Character Stage",
        "Sessions Attended",
        "Quizzes Completed",
        "Certificate Eligible",
        "Certificate Claimed",
        "Account Status",
        "Registered At",
    ])

    for s in students:
        writer.writerow([
            s.student_id or "N/A",
            s.full_name,
            s.email,
            s.university or "N/A",
            s.total_xp,
            s.character_stage,
            att_dict.get(s.id, 0),
            quiz_dict.get(s.id, 0),
            "YES" if s.total_xp >= cert_threshold else "NO",
            "YES" if s.id in cert_set else "NO",
            "Active" if s.is_active else "Suspended",
            s.created_at.strftime("%Y-%m-%d %H:%M:%S") if s.created_at else "N/A",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=vision_fusion_2_students_registry.csv"},
    )

