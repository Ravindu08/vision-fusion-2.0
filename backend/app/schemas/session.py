from typing import Optional
from datetime import date, time, datetime
from pydantic import BaseModel, ConfigDict


class SessionBase(BaseModel):
    title: str
    description: Optional[str] = None
    session_type: str = "PHYSICAL"  # PHYSICAL, ONLINE
    session_date: date
    start_time: time
    end_time: time
    venue: Optional[str] = None
    meeting_url: Optional[str] = None
    joining_instructions: Optional[str] = None
    xp_reward: int = 60
    is_active: bool = True


class SessionCreate(SessionBase):
    pass


class SessionRead(SessionBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    created_at: Optional[datetime] = None
    # User-specific participation state (computed dynamically when authenticated)
    has_participated: bool = False
    declared_at: Optional[datetime] = None

