@echo off
echo ========================================
echo   AI Resume Platform - Starting...
echo ========================================
echo.

echo [1/2] Starting Backend Server...
cd backend
start "Resume API Backend" cmd /k "uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/2] Starting Frontend Server...
cd ..\frontend
start "Resume Frontend" cmd /k "npm run dev"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
echo API Docs: http://localhost:8000/docs
echo.
echo Press any key to exit this window...
echo (Servers will continue running in separate windows)
pause >nul
