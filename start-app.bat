@echo off
chcp 65001 >nul
title Vitality Health Tracker - Startup
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║                                                              ║
echo  ║   🌿 VITALITY - Holistic Health ^& Fitness Tracker            ║
echo  ║                                                              ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
echo  Starting frontend development server...
echo.

REM Get the directory where this batch file is located
set "SCRIPT_DIR=%~dp0"
cd /d "%SCRIPT_DIR%"

echo  📁 Working directory: %SCRIPT_DIR%
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo  ⚠️  Dependencies not found. Installing...
    call npm install
    echo  ✅ Dependencies installed.
    echo.
)

REM Check if .env file exists
if not exist ".env" (
    echo  ⚠️  .env file not found!
    echo  Please create a .env file with your Supabase credentials:
    echo.
    echo  VITE_SUPABASE_URL=https://your-project.supabase.co
    echo  VITE_SUPABASE_ANON_KEY=your-anon-key
    echo.
    echo  See SUPABASE_SETUP.md for instructions.
    echo.
    pause
    exit /b 1
)

echo  🚀 Starting Frontend Dev Server (Port 5173)...
echo  └─ Window: Vitality Frontend
echo.
echo  Note: Backend is now handled by Supabase (cloud database)
echo.
start "Vitality Frontend" cmd /k "cd /d "%SCRIPT_DIR%" && echo Starting Frontend Dev Server... && npm run dev"

echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║  ✅ Frontend server started!                                   ║
echo  ║                                                              ║
echo  ║  📱 Open your browser and go to:                              ║
echo  ║     http://localhost:5173                                     ║
echo  ║                                                              ║
echo  ║  🗄️  Database: Supabase (cloud)                                ║
echo  ║  📝 Setup Guide: SUPABASE_SETUP.md                            ║
echo  ║                                                              ║
echo  ║  ❌ To stop: Close the server window or press Ctrl+C          ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.
pause
