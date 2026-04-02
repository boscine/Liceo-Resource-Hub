@echo off
echo --- STARTING ADET SERVICES ---

set "FE_PATH=%USERPROFILE%\Desktop\adet-mainproject-bsit22\adet-fe-bsit22\launch_fe.vbs"
set "BE_PATH=%USERPROFILE%\Desktop\adet-mainproject-bsit22\adet-be-bsit22\launch_be.vbs"

:: Start Backend
if exist "%BE_PATH%" (
    start wscript.exe "%BE_PATH%"
    echo [OK] Backend started.
) else (
    echo [ERROR] Cannot find: %BE_PATH%
)

:: Start Frontend
if exist "%FE_PATH%" (
    start wscript.exe "%FE_PATH%"
    echo [OK] Frontend started.
) else (
    echo [ERROR] Cannot find: %FE_PATH%
)

echo Waiting 15 seconds for servers...
timeout /t 15
start http://localhost:4200
exit