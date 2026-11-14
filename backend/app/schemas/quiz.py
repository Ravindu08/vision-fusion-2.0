from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


# Question Schema for Students (Anti-Cheat: Correct Answer is OMITTED)
class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    quiz_id: str
    question_text: str
    options: List[str]
    order_index: int


# Quiz Summary for Listing
class QuizSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    session_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    xp_reward: int
    pass_percentage: int
    total_questions: int = 0
    is_completed: bool = False
    user_score: Optional[int] = None
    user_percentage: Optional[float] = None
    has_passed: bool = False
    xp_earned: int = 0


# Detailed Quiz View with Questions
class QuizDetail(QuizSummary):
    questions: List[QuestionRead] = []


# Quiz Submission Request Payload: { "answers": { "<question_id>": selected_index } }
class QuizSubmission(BaseModel):
    answers: dict[str, int]


# Quiz Result Response
class QuizResultResponse(BaseModel):
    quiz_id: str
    quiz_title: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    pass_percentage: int
    xp_awarded: int
    new_total_xp: int
    character_stage: str
    has_evolved: bool
    is_certificate_eligible: bool
    message: str
    attempt_id: str

