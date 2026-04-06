@echo off
REM stop-dev.bat
REM This script kills the backend and frontend processes started by start-dev.bat

echo Shutting down ADET Development Environment...

REM 1. Try to close windows by title (Backend)
echo Stopping Backend (Hono)...
taskkill /F /FI "WINDOWTITLE eq Backend (Hono)*" /T >nul 2>&1

REM 2. Try to close windows by title (Frontend)
echo Stopping Frontend (Angular)...
taskkill /F /FI "WINDOWTITLE eq Frontend (Angular)*" /T >nul 2>&1

REM 3. Fallback: Kill node, tsx, and ng processes generally if they are still running
REM This ensures no ghost processes remain on ports 3000 or 4200.
taskkill /F /IM node.exe /T >nul 2>&1
taskkill /F /IM tsx.exe /T >nul 2>&1
taskkill /F /IM ng.exe /T >nul 2>&1

echo ✅ All services stopped.
REM pause
