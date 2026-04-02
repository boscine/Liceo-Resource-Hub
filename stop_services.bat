@echo off
echo --- STOPPING ADET SERVICES ---

:: Kill Node.js (this stops both the BE and the FE compiler)
taskkill /F /IM node.exe /T

:: Kill the script host (this stops the .vbs runners)
taskkill /F /IM wscript.exe /T

echo [OK] All services stopped.
pause