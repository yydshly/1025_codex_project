@echo off
cd /d "%~dp0"
if not exist node_modules\vite\bin\vite.js (
  echo Please run npm ci in this project first.
  pause
  exit /b 1
)
call npm run build
if errorlevel 1 (
  pause
  exit /b 1
)
echo Open http://127.0.0.1:4176/ in your browser.
call npm run preview
