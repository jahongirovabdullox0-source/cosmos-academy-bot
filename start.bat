@echo off
setlocal
set NODE_DIR=%LOCALAPPDATA%\Programs\node-v24.19.0-win-x64
set GIT_DIR=%LOCALAPPDATA%\Programs\PortableGit
set NGROK_DIR=%LOCALAPPDATA%\Programs\ngrok
set PATH=%NODE_DIR%;%GIT_DIR%\bin;%GIT_DIR%\cmd;%NGROK_DIR%;%PATH%

cd /d "%~dp0"

echo ============================================
echo   Cosmos Academy — lokal serverlar
echo ============================================
echo Backend:     http://localhost:4000
echo Mini App:    http://localhost:5173
echo Admin Panel: http://localhost:5174
echo Yopish uchun: Ctrl+C
echo ============================================

node scripts\dev.js
pause
