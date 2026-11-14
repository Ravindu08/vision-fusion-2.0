from fastapi import APIRouter
from app.api.v1.endpoints import auth, sessions, attendance, quizzes, certificates, leaderboard, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(sessions.router, prefix="/sessions", tags=["Sessions & Events"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Event Attendance & Participation"])
api_router.include_router(quizzes.router, prefix="/quizzes", tags=["Quizzes & Activities"])
api_router.include_router(certificates.router, prefix="/certificates", tags=["Certificates"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administrator Command Center"])
