@echo off
echo ===================================================
echo   Vision Fusion 2.0 - Starting Backend and Frontend
echo ===================================================

cd /d "%~dp0"

if not exist "backend\venv\Scripts\python.exe" (
    echo [NOTICE] Backend virtual environment not found! Running initial setup...
    call setup.bat
)

if not exist "frontend\node_modules" (
    echo [NOTICE] Frontend packages not found! Running initial setup...
    call setup.bat
)

start "Vision Fusion 2.0 - Backend (FastAPI)" cmd /k "cd /d %~dp0backend && venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

start "Vision Fusion 2.0 - Frontend (Vite)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ===================================================
echo   Both servers launched in separate windows!
echo   Backend API: http://127.0.0.1:8000
echo   Frontend:    http://127.0.0.1:5173
echo   Docs:        http://127.0.0.1:8000/api/v1/docs
echo ===================================================
pause
