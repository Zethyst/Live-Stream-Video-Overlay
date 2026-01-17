# Windows Setup Guide

## Prerequisites Installation

### 1. Install Python (3.8+)
- Download from: https://www.python.org/downloads/
- **IMPORTANT**: Check "Add Python to PATH" during installation

### 2. Install Node.js (18+)
- Download from: https://nodejs.org/
- Use the LTS version

### 3. Install MongoDB
**Option A: MongoDB Community Server (Local)**
- Download from: https://www.mongodb.com/try/download/community
- Run the installer, use default settings
- MongoDB will run as a Windows service automatically

**Option B: MongoDB Atlas (Cloud - Easier)**
- Sign up at: https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get connection string and update `backend/.env`

### 4. Install FFmpeg
**Option A: Using Chocolatey (Recommended)**
```powershell
# Install Chocolatey first (if not installed):
# Run PowerShell as Administrator
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg
```

**Option B: Manual Installation**
- Download from: https://www.gyan.dev/ffmpeg/builds/
- Extract to `C:\ffmpeg`
- Add `C:\ffmpeg\bin` to System PATH:
  1. Search "Environment Variables" in Start menu
  2. Click "Environment Variables"
  3. Under "System variables", find "Path"
  4. Click "Edit" → "New" → Add `C:\ffmpeg\bin`
  5. Click OK, restart terminal

### 5. Install MediaMTX (RTSP Server)
- Download from: https://github.com/bluenviron/mediamtx/releases
- Get `mediamtx_*_windows_amd64.zip`
- Extract to `C:\mediamtx\`
- Run `mediamtx.exe`

## Backend Setup

### 1. Open PowerShell or Command Prompt
```powershell
cd backend
```

### 2. Create Virtual Environment
```powershell
python -m venv venv
```

### 3. Activate Virtual Environment
**PowerShell:**
```powershell
.\venv\Scripts\Activate.ps1
```

**Command Prompt (cmd):**
```cmd
venv\Scripts\activate.bat
```

**If you get execution policy error in PowerShell:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 4. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 5. Configure Environment (Optional)
Create `backend/.env` file:
```env
PORT=3001
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/rtsp_overlay_db
CORS_ORIGINS=http://localhost:5173
HLS_OUTPUT_DIR=./streams
```

### 6. Start Backend
```powershell
python run.py
```

Should see:
```
🚀 Starting Flask server on http://0.0.0.0:3001
```

## Frontend Setup

### 1. Open New Terminal
```powershell
cd frontend
```

### 2. Install Dependencies
```powershell
npm install
```

### 3. Start Development Server
```powershell
npm run dev
```

Should see:
```
VITE ready in XXXms
➜ Local: http://localhost:5173/
```

## RTSP Streaming Setup

### 1. Start MediaMTX (Terminal 1)
```powershell
cd C:\mediamtx
.\mediamtx.exe
```

Should see:
```
INF MediaMTX v1.4.0
INF [RTSP] listener opened on :8554
```

### 2. Stream Your Video (Terminal 2)
```powershell
# Navigate to your video folder
cd C:\Users\YourName\Videos

# Stream the video
ffmpeg -re -stream_loop -1 -i your_video.mp4 -c:v libx264 -c:a aac -f rtsp rtsp://localhost:8554/mystream
```

**Common Video Locations:**
- `C:\Users\YourName\Videos\`
- `C:\Users\YourName\Downloads\`
- Desktop: `C:\Users\YourName\Desktop\`

### 3. Start Flask Backend (Terminal 3)
```powershell
cd backend
venv\Scripts\activate
python run.py
```

### 4. Start React Frontend (Terminal 4)
```powershell
cd frontend
npm run dev
```

### 5. Open Browser
- Navigate to: `http://localhost:5173`
- In the **RTSP Stream Manager** panel:
  - RTSP URL: `rtsp://localhost:8554/mystream`
  - Click **"Start Stream"**
  - Wait 3-5 seconds
  - Video should appear!

## Windows-Specific Tips

### Path Separators
Windows uses backslashes `\` instead of forward slashes `/`:
```powershell
# Windows
cd C:\Users\YourName\project

# Mac/Linux equivalent
cd /Users/yourname/project
```

### Terminal Options
1. **PowerShell** (Recommended) - Modern, built-in
2. **Command Prompt** (cmd) - Classic Windows terminal
3. **Git Bash** - Unix-like commands on Windows
4. **Windows Terminal** - New, modern terminal app

### Port Issues
If port 3001 is blocked, change in `backend/config.py`:
```python
PORT = int(os.getenv('PORT', 5001))  # Use different port
```
Then update frontend files to match.

### Firewall
If you can't connect, allow Python and Node in Windows Firewall:
1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find Python and Node.js, check both Private and Public

### Test Video Sources
If you don't have a video, use a test pattern:
```powershell
ffmpeg -re -f lavfi -i testsrc=size=1280x720:rate=30 -f lavfi -i sine=frequency=1000 -pix_fmt yuv420p -c:v libx264 -c:a aac -f rtsp rtsp://localhost:8554/mystream
```

## Troubleshooting Windows

### "python not found"
- Reinstall Python with "Add to PATH" checked
- Or use `py` instead of `python`:
  ```powershell
  py -m venv venv
  py run.py
  ```

### "npm not found"
- Restart terminal after Node.js installation
- Or add Node to PATH manually:
  - Default location: `C:\Program Files\nodejs`

### MongoDB Connection Failed
**Using Local MongoDB:**
- Check if service is running:
  ```powershell
  Get-Service MongoDB
  ```
- Start if stopped:
  ```powershell
  Start-Service MongoDB
  ```

**Using MongoDB Atlas:**
- Update `backend/.env`:
  ```env
  MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/rtsp_overlay_db
  ```

### FFmpeg Not Found
- Restart terminal after installation
- Verify:
  ```powershell
  ffmpeg -version
  ```

### Cannot Run Scripts in PowerShell
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use
Find and kill process using port:
```powershell
# Find process on port 3001
netstat -ano | findstr :3001

# Kill process (replace PID with actual number)
taskkill /PID <PID> /F
```

## Quick Start Script (Windows)

Create `start-all.bat` in project root:
```batch
@echo off
echo Starting RTSP Livestream Overlay...

start "MediaMTX" cmd /k "cd C:\mediamtx && mediamtx.exe"
timeout /t 2

start "Backend" cmd /k "cd backend && venv\Scripts\activate && python run.py"
timeout /t 3

start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3

start "Stream Video" cmd /k "cd C:\Users\YourName\Videos && ffmpeg -re -stream_loop -1 -i video.mp4 -c:v libx264 -c:a aac -f rtsp rtsp://localhost:8554/mystream"

echo All services started!
echo Open http://localhost:5173 in your browser
pause
```

Then just double-click `start-all.bat`!

## Production Deployment (Windows Server)

### Using IIS
1. Install IIS with CGI support
2. Install Python IIS extension (wfastcgi)
3. Configure Flask app as IIS site
4. Use nginx or IIS as reverse proxy

### Using Windows Service
Convert Flask to Windows Service using `nssm`:
```powershell
# Install nssm
choco install nssm

# Create service
nssm install RTSPBackend "C:\path\to\venv\Scripts\python.exe" "C:\path\to\run.py"
nssm start RTSPBackend
```

## Differences from Mac/Linux

| Feature | Mac/Linux | Windows |
|---------|-----------|---------|
| Python command | `python3` | `python` or `py` |
| Activate venv | `source venv/bin/activate` | `venv\Scripts\activate` |
| Path separator | `/` | `\` |
| Package manager | `brew` | `choco` or manual |
| MongoDB service | `brew services start mongodb` | Runs automatically |
| Terminal | Terminal.app | PowerShell/cmd |
| Config files | `~/.config` | `C:\Users\YourName\AppData` |

## Resources

- FFmpeg Windows: https://www.gyan.dev/ffmpeg/builds/
- MediaMTX: https://github.com/bluenviron/mediamtx
- MongoDB Windows: https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-windows/
- Python Windows: https://www.python.org/downloads/windows/
- Node.js Windows: https://nodejs.org/en/download/

## Need Help?

Common Windows issues:
1. **Path issues** - Use absolute paths: `C:\full\path\to\file`
2. **Permissions** - Run PowerShell as Administrator
3. **Antivirus** - May block Python/Node, add exceptions
4. **Firewall** - Allow Python and Node.js
