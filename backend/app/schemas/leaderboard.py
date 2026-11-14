from typing import List, Optional
from pydantic import BaseModel


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: str
    full_name: str
    university: str
    total_xp: int
    character_stage: str
    stage_slug: str
    overall_percent: float
    sessions_attended: int
    quizzes_completed: int
    certificate_unlocked: bool
    is_current_user: bool = False


class LeaderboardResponse(BaseModel):
    total_participants: int
    total_possible_xp: int
    certificate_threshold_xp: int
    entries: List[LeaderboardEntry]
    current_user_entry: Optional[LeaderboardEntry] = None

