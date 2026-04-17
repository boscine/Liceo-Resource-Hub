@echo off
REM C:\Users\You\Desktop\adet-mainproject-bsit22\start-lean.bat
echo --- Liceo Hub: Lean Dev Mode (Batch) ---

REM 1. Start Backend (256MB Limit)
echo [1/2] Starting Hono Backend (256MB Limit)...
start "Backend (Lean)" cmd /c "cd adet-be-bsit22 && set NODE_OPTIONS=--max-old-space-size=256 && npm run dev"

REM 2. Start Frontend Choice
echo [2/2] Frontend Strategy:
echo 1. Build & Serve Statically (Recommended for 4GB RAM)
echo 2. Minimal ng serve (768MB Limit)
set /p choice="Select strategy (1/2): "

if "%choice%"=="1" (
    echo Building...
    cd adet-fe-bsit22
    call npx ng build --configuration production
    echo Serving statically on http://localhost:4200
    start "Frontend (Static)" cmd /c "npx serve -s dist/adet-fe-bsit22/browser -p 4200"
    cd ..
) else (
    echo Starting Minimal ng serve (768MB Limit)...
    start "Frontend (Lite)" cmd /c "cd adet-fe-bsit22 && set NODE_OPTIONS=--max-old-space-size=768 && npx ng serve --configuration=development --proxy-config proxy.conf.json --live-reload=false"
)

echo Lean environment initiated.
pause
