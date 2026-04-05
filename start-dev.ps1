# C:\Users\You\Desktop\adet-mainproject-bsit22\start-dev.ps1

# Configuration for 4GB RAM environment
$env:NODE_OPTIONS = "--max-old-space-size=1536" # Global limit for Angular
$BACKEND_MEMORY = "512" # Hono is lightweight

# 1. Start Backend (Hono)
Write-Host "Starting Hono Backend (Memory Limit: ${BACKEND_MEMORY}MB)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd adet-be-bsit22; `$env:NODE_OPTIONS='--max-old-space-size=$BACKEND_MEMORY'; npm run dev" -WindowStyle Normal

# 2. Start Frontend (Angular)
Write-Host "Starting Angular Frontend (Memory Limit: 1536MB)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd adet-fe-bsit22; `$env:NODE_OPTIONS='--max-old-space-size=1536'; npx ng serve --configuration=development --proxy-config proxy.conf.json --live-reload=false" -WindowStyle Normal

# 3. Optional: MySQL Connection Check (if mysql-cli is in PATH)
Write-Host "Checking MySQL Connection (adet_bsitdb22)..." -ForegroundColor Yellow
try {
    # Check if MySQL is running (simple ping)
    & mysqladmin -u root -p12345 ping | Out-Null
    Write-Host "MySQL is ONLINE." -ForegroundColor Green
} catch {
    Write-Host "MySQL is OFFLINE or password '12345' is incorrect. Ensure MySQL service is running." -ForegroundColor Red
}
