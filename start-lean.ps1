# C:\Users\You\Desktop\adet-mainproject-bsit22\start-lean.ps1
# ULTRA-LEAN Startup for 4GB RAM Environments

Write-Host "--- Liceo Hub: Lean Dev Mode ---" -ForegroundColor Yellow

# 1. Environment Configuration
$BACKEND_MEMORY = "256"
$FRONTEND_MEMORY = "768"
$env:NODE_OPTIONS = "--max-old-space-size=768"

# 2. Start Backend (Minimalist)
Write-Host "[1/2] Starting Hono Backend (Limit: ${BACKEND_MEMORY}MB)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd adet-be-bsit22; `$env:NODE_OPTIONS='--max-old-space-size=$BACKEND_MEMORY'; npm run dev" -WindowStyle Normal

# 3. Start Frontend (Static Option or Minimal Serve)
Write-Host "[2/2] Configuration Selection:" -ForegroundColor Cyan
Write-Host " [A] Build & Serve Statically (Recommended for 4GB RAM - saves ~1GB RAM)" -ForegroundColor White
Write-Host " [B] Minimal ng serve (No Live-Reload, 768MB Limit)" -ForegroundColor White

$choice = Read-Host "Select option (A/B)"

if ($choice -eq "A") {
    Write-Host "Building frontend... this may take a moment but will save RAM during development." -ForegroundColor Yellow
    cd adet-fe-bsit22
    npx ng build --configuration production --optimization
    Write-Host "Serving static files on http://localhost:4200..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd adet-fe-bsit22; npx serve -s dist/adet-fe-bsit22/browser -p 4200" -WindowStyle Normal
    cd ..
} else {
    Write-Host "Starting Minimal ng serve (Limit: ${FRONTEND_MEMORY}MB)..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd adet-fe-bsit22; `$env:NODE_OPTIONS='--max-old-space-size=$FRONTEND_MEMORY'; npx ng serve --configuration=development --proxy-config proxy.conf.json --live-reload=false" -WindowStyle Normal
}

Write-Host "Lean startup complete. Monitor RAM in Task Manager." -ForegroundColor Yellow
