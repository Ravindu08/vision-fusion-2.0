from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class AdminStats(BaseModel):
    total_students: int
    total_sessions: int
    total_attendance_records: int
    total_quizzes: int
    total_quiz_attempts: int
    total_certificates_claimed: int
    total_certificates_eligible: int


class AdminUserItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    full_name: str
    email: str
    university: Optional[str] = None
    student_id: Optional[str] = None
    role: str
    total_xp: int
    character_stage: str
    is_active: bool
    created_at: Optional[datetime] = None
    sessions_attended: int = 0
    quizzes_completed: int = 0
    certificate_eligible: bool = False
    certificate_claimed: bool = False


class AdminUserListResponse(BaseModel):
    total: int
    users: List[AdminUserItem]


class AdminUserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    university: Optional[str] = Field(None, max_length=150)
    student_id: Optional[str] = Field(None, max_length=50)
    total_xp: Optional[int] = Field(0, ge=0, le=1000)


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6, max_length=128)
    student_id: Optional[str] = Field(None, max_length=50)
    university: Optional[str] = Field(None, max_length=150)
    total_xp: Optional[int] = Field(None, ge=0, le=1000)
    is_active: Optional[bool] = None

