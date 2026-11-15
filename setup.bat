@echo off
echo ===================================================
echo   Vision Fusion 2.0 - Automated Setup Script
echo ===================================================

cd /d "%~dp0"

echo [1/4] Checking Backend Environment...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

if not exist .env (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo [2/4] Installing Python dependencies...
venv\Scripts\python.exe -m pip install --upgrade pip
venv\Scripts\python.exe -m pip install -r requirements.txt

echo [3/4] Checking Frontend Environment...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend npm packages...
    npm install
)

cd ..
echo.
echo ===================================================
echo   Setup Completed Successfully!
echo   You can now run "start_servers.bat" anytime.
echo ===================================================
pause
