from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, Token, UserRead, UserProgressRead
from app.core.security import verify_password, get_password_hash, create_access_token
from app.core.gamification_config import calculate_character_stage
from app.core.config import settings
from app.api.deps import get_current_user

router = APIRouter()


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    """Register a new student account."""
    # Check duplicate email
    existing_user = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Hash password securely
    hashed_pw = get_password_hash(user_in.password)

    # Create new student user
    new_user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=hashed_pw,
        university=user_in.university.strip() if user_in.university else "Uva Wellassa University",
        student_id=user_in.student_id.strip() if user_in.student_id else None,
        role="STUDENT",
        total_xp=0,
        character_stage="The Recruit",
        is_active=True,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate JWT
    access_token = create_access_token(subject=new_user.id, role=new_user.role)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": new_user,
    }


@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    """Authenticate student or admin and return JWT access token."""
    user = db.query(User).filter(User.email == login_in.email.lower().strip()).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not verify_password(login_in.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User account is deactivated.",
        )

    access_token = create_access_token(subject=user.id, role=user.role)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get("/me", response_model=UserProgressRead)
def get_current_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fetch authenticated user profile with real-time character progression metrics."""
    stage_info = calculate_character_stage(
        current_xp=current_user.total_xp,
        total_possible_xp=settings.TOTAL_POSSIBLE_XP
    )

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "university": current_user.university,
        "student_id": current_user.student_id,
        "role": current_user.role,
        "total_xp": current_user.total_xp,
        "character_stage": current_user.character_stage,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at,
        "stage_slug": stage_info["stage_slug"],
        "stage_progress_percent": stage_info["stage_progress_percent"],
        "overall_percent": stage_info["overall_percent"],
        "xp_to_next_stage": stage_info["xp_to_next_stage"],
        "next_stage_title": stage_info["next_stage_title"],
        "is_certificate_eligible": stage_info["is_certificate_eligible"],
    }

