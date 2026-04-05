@echo off
REM C:\Users\You\Desktop\adet-mainproject-bsit22\start-dev.bat

echo Starting ADET Development Environment (CMD)...

REM 1. Start Backend (Hono)
echo Starting Hono Backend (Memory Limit: 512MB)...
start "Backend (Hono)" cmd /c "cd adet-be-bsit22 && set NODE_OPTIONS=--max-old-space-size=512 && npm run dev"

REM 2. Start Frontend (Angular)
echo Starting Angular Frontend (Memory Limit: 1536MB)...
start "Frontend (Angular)" cmd /c "cd adet-fe-bsit22 && set NODE_OPTIONS=--max-old-space-size=1536 && npx ng serve --configuration=development --proxy-config proxy.conf.json --live-reload=false"

REM 3. MySQL Connection Check
echo Checking MySQL Connection (adet_bsitdb22)...
mysqladmin -u root -p12345 ping >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo MySQL is ONLINE.
) else (
    echo [ERROR] MySQL is OFFLINE or password '13245' is incorrect.
)

pause
