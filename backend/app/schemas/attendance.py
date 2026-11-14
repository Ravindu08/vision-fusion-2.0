from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class AttendanceDeclareResponse(BaseModel):
    success: bool = True
    message: str
    session_id: str
    session_title: str
    xp_awarded: int
    new_total_xp: int
    character_stage: str
    has_evolved: bool
    declared_at: datetime


class AttendanceRecord(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: str
    session_title: Optional[str] = None
    xp_awarded: int
    declared_at: datetime

