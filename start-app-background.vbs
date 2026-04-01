' Vitality Health Tracker - Silent Startup Script
' This script starts both servers without showing command windows

Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

' Get the script directory
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)

' Start Backend Server (hidden)
backendCmd = "cmd /c cd /d """ & scriptDir & "\server"" && set PORT=3002 && node index.js"
WshShell.Run backendCmd, 0, False

' Wait a moment for backend to start
WScript.Sleep 2000

' Start Frontend Dev Server (hidden)
frontendCmd = "cmd /c cd /d """ & scriptDir & """ && npm run dev"
WshShell.Run frontendCmd, 0, False

' Show success message
MsgBox "🌿 Vitality servers started!" & vbCrLf & vbCrLf & _
       "Backend: http://localhost:3002" & vbCrLf & _
       "Frontend: http://localhost:5173" & vbCrLf & vbCrLf & _
       "Open your browser and navigate to:" & vbCrLf & _
       "http://localhost:5173", _
       vbInformation, "Vitality Health Tracker"

Set WshShell = Nothing
Set fso = Nothing
