@echo off
cd /d "%~dp0"
echo Starting Vitality frontend...
echo.
echo Frontend will start on Port 5173
echo Backend is handled by Supabase (cloud database)
echo.
echo Press Ctrl+C to stop the server
echo.

start cmd /k "npm run dev"

echo.
echo Server started! Open http://localhost:5173 in your browser
echo.
pause
