@echo off
title Daily Routine App Launcher
echo ========================================================
echo   Launching Daily Routine App...
echo ========================================================

:: Check if server is already responding on port 3000
powershell -Command "$tcp = New-Object Net.Sockets.TcpClient; try { $tcp.Connect('127.0.0.1', 3000); exit 0 } catch { exit 1 }" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting background application server...
    start /b "" node server.js >nul 2>&1
    timeout /t 2 /nobreak >nul
)

:: Launch in dedicated Standalone App window (no URL bar, like a native app)
echo Opening application window...
if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" (
    start "" "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --app="http://localhost:3000/index.html" --window-size=440,900
) else (
    start "" "http://localhost:3000/index.html"
)

echo Done! The app is now running.
