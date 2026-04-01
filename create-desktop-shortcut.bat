@echo off
echo Creating desktop shortcut for Vitality...
echo.

set "SCRIPT_DIR=%~dp0"
set "DESKTOP=%USERPROFILE%\Desktop"

REM Create a shortcut VBScript
(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%DESKTOP%\Vitality Health Tracker.lnk"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%SCRIPT_DIR%start-app.bat"
echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
echo oLink.IconLocation = "%SCRIPT_DIR%public\favicon.ico,0"
echo oLink.Description = "Start Vitality Health Tracker"
echo oLink.Save
) > "%TEMP%\CreateShortcut.vbs"

cscript //nologo "%TEMP%\CreateShortcut.vbs"
del "%TEMP%\CreateShortcut.vbs"

echo ✅ Shortcut created on your desktop!
echo.
echo You can now double-click "Vitality Health Tracker" on your desktop to start the app.
echo.
pause
