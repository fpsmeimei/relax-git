@echo off
title AI Movie System - Start All Services

echo ========================================
echo   AI Movie Recommendation System
echo   Starting All Services...
echo ========================================
echo.

REM Check if pnpm is installed
where pnpm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] pnpm not found
    echo Please install: npm install -g pnpm
    pause
    exit /b 1
)

echo [1/3] Starting Docker Services...
start "Docker Services" cmd /k "cd /d %~dp0 && echo Starting Docker... && pnpm docker:dev"
timeout /t 3 /nobreak >nul

echo [2/3] Starting Backend API...
start "Backend API" cmd /k "cd /d %~dp0 && echo Starting API (port 3001)... && pnpm -C apps/api dev"
timeout /t 3 /nobreak >nul

echo [3/3] Starting Frontend Web...
start "Frontend Web" cmd /k "cd /d %~dp0 && echo Starting Web (port 3000)... && pnpm -C apps/web dev"

echo.
echo ========================================
echo   All Services Started!
echo ========================================
echo.
echo Services:
echo   - Docker:      Database and Redis
echo   - Backend API: http://localhost:3001
echo   - Frontend:    http://localhost:3000
echo.
echo Tips:
echo   - Each service runs in separate window
echo   - Close window to stop service
echo   - Or press Ctrl+C in window
echo.
echo ========================================
echo.
echo Press any key to exit...
pause >nul
