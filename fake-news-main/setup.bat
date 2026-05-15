@echo off
REM Quick start script for Windows PowerShell
REM This script sets up both backend and frontend for testing

echo.
echo ========================================
echo Fake News Detection Platform - Setup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Step 1: Setting up Backend...
echo.
cd backend

REM Recreate virtual environment to avoid stale launcher paths
if exist venv (
    echo Removing existing virtual environment...
    rmdir /s /q venv
)

echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
python -m pip install -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py migrate

REM Create superuser
echo.
echo Creating admin user...
python manage.py shell < create_admin.py

echo.
echo Backend setup complete!
echo.

REM Go back to root
cd ..

echo.
echo Step 2: Setting up Frontend...
echo.
cd frontend

REM Install dependencies
echo Installing npm dependencies...
call npm install

echo.
echo Frontend setup complete!
echo.
cd ..

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the backend:
echo   1. Open PowerShell
echo   2. Navigate to: backend
echo   3. Run: venv\Scripts\activate
echo   4. Run: python manage.py runserver
echo.
echo To start the frontend:
echo   1. Open another PowerShell
echo   2. Navigate to: frontend
echo   3. Run: npm run dev
echo.
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Admin Credentials:
echo   Username: admin
echo   Password: admin123
echo.
pause
