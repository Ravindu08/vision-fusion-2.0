from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


# Registration Request
class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)
    university: Optional[str] = "Uva Wellassa University"
    student_id: Optional[str] = None


# Login Request
class UserLogin(BaseModel):
    email: EmailStr
    password: str


# User Profile Response
class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: str
    university: Optional[str]
    student_id: Optional[str]
    role: str
    total_xp: int
    character_stage: str
    is_active: bool
    created_at: Optional[datetime] = None


# Token Response
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead


# User Profile with Progression Details
class UserProgressRead(UserRead):
    stage_slug: str
    stage_progress_percent: float
    overall_percent: float
    xp_to_next_stage: int
    next_stage_title: str
    is_certificate_eligible: bool
