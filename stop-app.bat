@echo off
title Vitality Health Tracker - Stop Servers
echo.
echo  Stopping Vitality servers...
echo.

REM Kill node processes related to Vitality
echo  🔴 Stopping Backend Server (Port 3002)...
taskkill /FI "WINDOWTITLE eq Vitality Backend" /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq Vitality Frontend" /F >nul 2>&1

REM Also kill any node processes on the specific ports
echo  🔴 Cleaning up port 3002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo  🔴 Cleaning up port 5173...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo  ✅ All Vitality servers stopped!
echo.
pause
