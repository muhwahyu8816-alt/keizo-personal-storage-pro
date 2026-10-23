@echo off
title Keizo Personal Storage Pro
cd /d "%~dp0"
if not exist "node_modules" (
  echo Memasang dependensi yang diperlukan...
  call npm install express express-session dotenv googleapis
  if errorlevel 1 (
    echo Instalasi gagal. Periksa Node.js dan koneksi internet.
    pause
    exit /b 1
  )
)
node server.js
pause
