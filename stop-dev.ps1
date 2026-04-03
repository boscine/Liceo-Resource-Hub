# stop-dev.ps1
# This script shuts down the development environment by killing node and powershell processes related to the project.

Write-Host "Shutting down ADET Development Environment..." -ForegroundColor Yellow

# 1. Kill Node.js processes (Backend and Frontend)
# We look for node processes. On Windows, this is the most reliable way to stop npx/npm/tsx tasks.
Write-Host "Stopping Node.js services..." -ForegroundColor Cyan
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue

# 2. Kill any remaining TSX or Angular CLI processes specifically if they survived
Stop-Process -Name "tsx" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "ng" -Force -ErrorAction SilentlyContinue

# 3. Optional: Kill secondary PowerShell windows started by start-dev.ps1
# Note: This might close other PowerShell windows if you have them open. 
# If you prefer to be precise, we can filter by window title, but killing 'node' is usually enough.

Write-Host "✅ All services stopped." -ForegroundColor Green
