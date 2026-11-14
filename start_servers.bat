@echo off
echo ===================================================
echo   Vision Fusion 2.0 - Starting Backend and Frontend
echo ===================================================

start "Vision Fusion 2.0 - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

start "Vision Fusion 2.0 - Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npx vite --host 127.0.0.1 --port 5173"

echo Servers started in separate windows!
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://127.0.0.1:5173
pause
