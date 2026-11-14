from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.db.session import get_db
from app.models.user import User
from app.models.quiz import Quiz
from app.models.question import Question
from app.models.quiz_attempt import QuizAttempt
from app.models.xp_transaction import XPTransaction
from app.schemas.quiz import (
    QuizSummary,
    QuizDetail,
    QuestionRead,
    QuizSubmission,
    QuizResultResponse,
)
from app.api.deps import get_current_user
from app.api.v1.endpoints.sessions import get_optional_user
from app.core.gamification_config import calculate_character_stage
from app.core.config import settings

router = APIRouter()


@router.get("", response_model=List[QuizSummary])
def get_quizzes(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    List all active quizzes.
    If authenticated, enriches each quiz with the student's attempt status, score, and earned XP.
    """
    quizzes = (
        db.query(Quiz)
        .filter(Quiz.is_active == True)
        .order_by(Quiz.created_at.asc())
        .all()
    )

    user_attempts = {}
    if current_user:
        attempts = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.user_id == current_user.id)
            .order_by(QuizAttempt.xp_awarded.desc(), QuizAttempt.score.desc())
            .all()
        )
        for att in attempts:
            if att.quiz_id not in user_attempts:
                user_attempts[att.quiz_id] = att

    results = []
    for q in quizzes:
        q_count = db.query(Question).filter(Question.quiz_id == q.id).count()
        att = user_attempts.get(q.id)

        results.append({
            "id": q.id,
            "session_id": q.session_id,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "pass_percentage": q.pass_percentage,
            "total_questions": q_count,
            "is_completed": att is not None,
            "user_score": att.score if att else None,
            "user_percentage": att.percentage if att else None,
            "has_passed": att.passed if att else False,
            "xp_earned": att.xp_awarded if att else 0,
        })

    return results


@router.get("/{quiz_id}", response_model=QuizDetail)
def get_quiz_detail(
    quiz_id: str,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    """
    Retrieve quiz questions for the quiz player.
    Crucial Security: `correct_option_index` is strictly omitted from the QuestionRead response schema.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found or is currently inactive."
        )

    questions = (
        db.query(Question)
        .filter(Question.quiz_id == quiz_id)
        .order_by(Question.order_index.asc())
        .all()
    )

    att = None
    if current_user:
        att = (
            db.query(QuizAttempt)
            .filter(QuizAttempt.user_id == current_user.id, QuizAttempt.quiz_id == quiz_id)
            .order_by(QuizAttempt.xp_awarded.desc(), QuizAttempt.score.desc())
            .first()
        )

    question_reads = [
        QuestionRead(
            id=q.id,
            quiz_id=q.quiz_id,
            question_text=q.question_text,
            options=q.options,
            order_index=q.order_index,
        )
        for q in questions
    ]

    return {
        "id": quiz.id,
        "session_id": quiz.session_id,
        "title": quiz.title,
        "description": quiz.description,
        "xp_reward": quiz.xp_reward,
        "pass_percentage": quiz.pass_percentage,
        "total_questions": len(question_reads),
        "is_completed": att is not None,
        "user_score": att.score if att else None,
        "user_percentage": att.percentage if att else None,
        "has_passed": att.passed if att else False,
        "xp_earned": att.xp_awarded if att else 0,
        "questions": question_reads,
    }


@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz(
    quiz_id: str,
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit quiz answers, score server-side, evaluate pass status, and award XP atomically.
    """
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id, Quiz.is_active == True).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found."
        )

    # 0. Reject administrator quiz submissions
    if current_user.role == "ADMIN":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrator accounts cannot submit quizzes or gain student XP."
        )

    # Check if student already completed this quiz (if retakes prohibited)
    existing_attempt = (
        db.query(QuizAttempt)
        .filter(QuizAttempt.user_id == current_user.id, QuizAttempt.quiz_id == quiz_id)
        .first()
    )

    if existing_attempt and not quiz.allow_retakes:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You have already completed '{quiz.title}'. Retakes are not allowed."
        )

    # Load all questions to grade on server
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    total_questions = len(questions)

    if total_questions == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This quiz has no questions configured."
        )

    # Server-side score calculation
    correct_count = 0
    for q in questions:
        student_choice = submission.answers.get(q.id)
        if student_choice is not None and student_choice == q.correct_option_index:
            correct_count += 1

    percentage = round((correct_count / total_questions) * 100.0, 1)
    passed = percentage >= quiz.pass_percentage

    # Proportional score-based XP (e.g. 10 MCQs x 7 XP = 70 XP total)
    current_earned_xp = int(round((correct_count / total_questions) * quiz.xp_reward)) if passed else 0

    # User's prior maximum XP awarded on this quiz (or session)
    prior_max_xp = (
        db.query(func.max(QuizAttempt.xp_awarded))
        .join(Quiz, Quiz.id == QuizAttempt.quiz_id)
        .filter(
            QuizAttempt.user_id == current_user.id,
            (Quiz.id == quiz.id) | (Quiz.session_id == quiz.session_id)
        )
        .scalar()
        or 0
    )

    # Incremental XP award (strictly adds ONLY the higher score difference on retake!)
    xp_to_award = max(0, current_earned_xp - prior_max_xp)

    now_utc = datetime.now(timezone.utc)

    try:
        # 1. Record Quiz Attempt with earned XP on this attempt
        attempt = QuizAttempt(
            user_id=current_user.id,
            quiz_id=quiz.id,
            score=correct_count,
            total_questions=total_questions,
            percentage=percentage,
            passed=passed,
            xp_awarded=current_earned_xp,
            completed_at=now_utc,
        )
        db.add(attempt)
        db.flush()

        # 2. If incremental XP awarded, create XPTransaction and increment User total_xp
        previous_stage = current_user.character_stage
        has_evolved = False

        if xp_to_award > 0:
            xp_tx = XPTransaction(
                user_id=current_user.id,
                amount=xp_to_award,
                source_type="QUIZ",
                reference_id=quiz.id,
                description=f"Quiz '{quiz.title}': {correct_count}/{total_questions} ({percentage}%), +{xp_to_award} XP",
                created_at=now_utc,
            )
            db.add(xp_tx)

            current_user.total_xp += xp_to_award

            # Recalculate Character Stage
            stage_info = calculate_character_stage(
                current_xp=current_user.total_xp,
                total_possible_xp=settings.TOTAL_POSSIBLE_XP
            )
            new_stage = stage_info["current_stage"].value if hasattr(stage_info["current_stage"], "value") else str(stage_info["current_stage"])
            has_evolved = new_stage != previous_stage
            if has_evolved:
                current_user.character_stage = new_stage

        db.commit()
        db.refresh(current_user)

    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit quiz: {str(e)}"
        )

    # Character and cert status
    user_stage_info = calculate_character_stage(
        current_xp=current_user.total_xp,
        total_possible_xp=settings.TOTAL_POSSIBLE_XP
    )

    if passed:
        message = f"Congratulations! You scored {correct_count}/{total_questions} ({percentage}%) and earned +{xp_to_award} XP!"
    else:
        message = f"You scored {correct_count}/{total_questions} ({percentage}%). The passing threshold is {quiz.pass_percentage}%. Keep learning!"

    return {
        "quiz_id": quiz.id,
        "quiz_title": quiz.title,
        "score": correct_count,
        "total_questions": total_questions,
        "percentage": percentage,
        "passed": passed,
        "pass_percentage": quiz.pass_percentage,
        "xp_awarded": xp_to_award,
        "new_total_xp": current_user.total_xp,
        "character_stage": current_user.character_stage,
        "has_evolved": has_evolved,
        "is_certificate_eligible": user_stage_info["is_certificate_eligible"],
        "message": message,
        "attempt_id": attempt.id,
    }

