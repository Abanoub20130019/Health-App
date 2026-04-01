# 🌿 Vitality - How to Start the App

## Quick Start (Recommended)

### Option 1: Double-click to start
1. Navigate to the `health-tracker` folder
2. Double-click **`start-app.bat`**
3. Wait for two command windows to open
4. Open your browser and go to: **http://localhost:5173**

### Option 2: Silent startup (no windows)
1. Double-click **`start-app-background.vbs`**
2. Wait for the success message
3. Click OK and open: **http://localhost:5173**

### Option 3: Simple startup
1. Double-click **`start-app-simple.bat`**
2. Wait for the servers to start
3. Open your browser and go to: **http://localhost:5173**

---

## File Descriptions

| File | Description |
|------|-------------|
| `start-app.bat` | Main startup script with pretty UI. Opens two separate windows for backend and frontend. Automatically installs dependencies if missing. |
| `start-app-simple.bat` | Minimal startup script. Quick and simple, no extra output. |
| `start-app-background.vbs` | Silent startup. Runs servers in background without showing command windows. |
| `stop-app.bat` | Stops all Vitality servers. Run this when you're done. |

---

## Manual Start (If batch files don't work)

Open **two** separate command windows and run:

### Window 1 - Backend:
```cmd
cd health-tracker\server
set PORT=3002
node index.js
```

### Window 2 - Frontend:
```cmd
cd health-tracker
npm run dev
```

Then open: http://localhost:5173

---

## Troubleshooting

### Port already in use
If you see "EADDRINUSE" error, run `stop-app.bat` first to kill any running servers.

### Missing dependencies
If you see "module not found" errors, run:
```cmd
cd health-tracker
npm install
cd server
npm install
```

### Backend won't start
Check if port 3002 is available:
```cmd
netstat -ano | findstr :3002
```

If something is using it, either close that program or change the port in the batch file.

---

## URLs

| Service | URL |
|---------|-----|
| App (Frontend) | http://localhost:5173 |
| API (Backend) | http://localhost:3002 |

---

## Stopping the App

1. Close the command windows, OR
2. Press `Ctrl+C` in each window and confirm with `Y`, OR
3. Run `stop-app.bat` to forcefully kill all processes
