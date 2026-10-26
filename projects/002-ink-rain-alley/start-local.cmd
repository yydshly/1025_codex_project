@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22.12 or newer, then run this file again.
  pause
  exit /b 1
)
if not exist "node_modules\vite\package.json" (
  call npm.cmd ci --no-audit --no-fund
  if errorlevel 1 (
    echo Dependency installation failed. Check the output above.
    pause
    exit /b 1
  )
)
echo Open http://127.0.0.1:4174/ in your browser.
call npm.cmd run dev
pause
