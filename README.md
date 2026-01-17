# 🎥 StreamOverlay - RTSP Livestream Manager

A professional web application for managing real-time overlays on RTSP livestreams. Add, position, and customize text and image overlays on your video streams with an intuitive interface.

## ✨ Features

- 📹 **RTSP to HLS Conversion** - Stream RTSP feeds in web browsers
- 🎨 **Dynamic Overlays** - Add text and image overlays in real-time
- 🖱️ **Drag & Drop** - Intuitive positioning and resizing
- 💾 **Persistent Storage** - MongoDB backend for overlay management
- 🎯 **Layer Control** - Manage z-index and opacity
- ⌨️ **Keyboard Shortcuts** - Delete and Escape keys for quick actions

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Python** (v3.8+)
- **MongoDB** (running on localhost:27017)
- **FFmpeg** (for RTSP to HLS conversion)

Install FFmpeg:
```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Create virtual environment:**
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

4. **Configure environment (optional):**
Create a `.env` file in the backend directory:
```env
PORT=8080
HOST=0.0.0.0
MONGO_URI=mongodb://localhost:27017/rtsp_overlay_db
CORS_ORIGINS=http://localhost:5173
HLS_OUTPUT_DIR=./streams
```

5. **Start the Flask server:**
```bash
python3 run.py
```

The API will be available at `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment (optional):**
Create a `.env` file in the frontend directory:
```env
VITE_API_BASE=http://localhost:8080/api
```

4. **Start the development server:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📡 RTSP Streaming Setup

### Integrated Stream Management (Recommended)

The application now includes **built-in RTSP to HLS conversion** managed through the web interface:

1. **Start your Flask backend** (if not already running):
```bash
cd backend
python3 run.py
```

2. **Open the web application** at `http://localhost:5173`

3. **Use the Stream Manager** (top of the page):
   - Enter your RTSP URL (e.g., `rtsp://localhost:8554/mystream`)
   - Click "Start Stream"
   - The conversion happens automatically in the background
   - Stream will appear in the video player below

4. **Stream Controls:**
   - **Start**: Begin RTSP to HLS conversion
   - **Stop**: Stop the conversion
   - **Restart**: Restart the current stream
   - Status indicator shows if stream is running

**Example RTSP URLs:**
```
rtsp://localhost:8554/mystream
rtsp://admin:password@192.168.1.100:554/stream1
rtsp://camera-ip:port/path
```

### Manual Conversion (Alternative Method)

You can also manually run the converter script:

```bash
cd backend
python3 rtsp_to_hls.py rtsp://your-camera-ip:554/stream
```

Then click "Local Stream" button in the web app.

### Changing RTSP URL

**Method 1: Using Stream Manager (Easiest)**
- Stop the current stream
- Enter new RTSP URL
- Click "Start Stream"

**Method 2: Using API**
```bash
# Start stream
curl -X POST http://localhost:8080/api/stream/start \
  -H "Content-Type: application/json" \
  -d '{"rtsp_url": "rtsp://localhost:8554/mystream"}'

# Stop stream
curl -X POST http://localhost:8080/api/stream/stop

# Check status
curl http://localhost:8080/api/stream/status
```

**Method 3: Manual converter script**
- Stop current converter (Ctrl+C)
- Start with new URL: `python3 rtsp_to_hls.py rtsp://new-url`

## 📚 API Documentation

Base URL: `http://localhost:8080/api`

### Overlays Endpoints

#### Get All Overlays
```http
GET /api/overlays
```

**Response:**
```json
[
  {
    "id": "uuid-string",
    "type": "text",
    "position": { "x": 100, "y": 50 },
    "size": { "width": 200, "height": 50 },
    "config": {
      "text": "Live",
      "fontSize": 24,
      "fontFamily": "Arial",
      "color": "#ffffff"
    },
    "zIndex": 1,
    "opacity": 1
  }
]
```

#### Create Overlay
```http
POST /api/overlays
Content-Type: application/json
```

**Text Overlay Request:**
```json
{
  "type": "text",
  "position": { "x": 50, "y": 50 },
  "size": { "width": 200, "height": 50 },
  "config": {
    "text": "Breaking News",
    "fontSize": 32,
    "fontFamily": "Arial",
    "color": "#ff0000"
  },
  "zIndex": 1,
  "opacity": 1
}
```

**Image Overlay Request:**
```json
{
  "type": "image",
  "position": { "x": 100, "y": 100 },
  "size": { "width": 150, "height": 100 },
  "config": {
    "imageUrl": "https://example.com/logo.png"
  },
  "zIndex": 2,
  "opacity": 0.8
}
```

**Response:** `201 Created` with created overlay object

#### Update Overlay
```http
PUT /api/overlays/:id
Content-Type: application/json
```

**Request (partial update):**
```json
{
  "position": { "x": 150, "y": 75 },
  "opacity": 0.9
}
```

**Response:** `200 OK` with updated overlay

#### Delete Overlay
```http
DELETE /api/overlays/:id
```

**Response:** `200 OK`
```json
{
  "message": "Overlay deleted successfully"
}
```

### Stream Management Endpoints

#### Start RTSP Stream
```http
POST /api/stream/start
Content-Type: application/json
```

**Request:**
```json
{
  "rtsp_url": "rtsp://localhost:8554/mystream"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Stream started successfully",
  "rtsp_url": "rtsp://localhost:8554/mystream",
  "hls_url": "/stream.m3u8"
}
```

#### Stop Stream
```http
POST /api/stream/stop
```

**Response:**
```json
{
  "status": "success",
  "message": "Stream stopped successfully"
}
```

#### Get Stream Status
```http
GET /api/stream/status
```

**Response:**
```json
{
  "is_running": true,
  "rtsp_url": "rtsp://localhost:8554/mystream",
  "hls_url": "/stream.m3u8"
}
```

#### Restart Stream
```http
POST /api/stream/restart
```

**Response:**
```json
{
  "status": "success",
  "message": "Stream restarted"
}
```

### HLS File Serving

#### Get HLS Manifest
```http
GET /stream.m3u8
```

Returns the HLS playlist file with CORS headers.

#### Get HLS Segments
```http
GET /stream{N}.ts
```

Returns video segment files (e.g., `stream0.ts`, `stream1.ts`).

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

## 🎮 User Guide

### Playing Livestreams

1. **Start your RTSP to HLS converter** (see RTSP Streaming Setup above)
2. **Open the web application** at `http://localhost:5173`
3. **Connect to stream:**
   - Click "Local Stream" for converted RTSP stream
   - Click "Demo Stream" for test stream
   - Or enter custom HLS URL and click "Connect"
4. **Video controls:**
   - Play/Pause button
   - Volume control
   - Fullscreen mode

### Managing Overlays

#### Adding Overlays

1. **Open Overlay Panel** (right side of screen)
2. **Click "Add Text"** or **"Add Image"**
3. **Configure overlay:**
   - **Text:** Enter text, choose font, size, and color
   - **Image:** Enter image URL
4. **Click "Add"**

#### Positioning Overlays

- **Drag** overlay to move it
- **Drag corners** to resize
- **Click** overlay to select it

#### Editing Overlays

1. **Select overlay** by clicking it
2. **In the control panel:**
   - Adjust **opacity** with slider
   - Click **"Front"** or **"Back"** to change layer order
   - Click **"Edit"** to modify content
   - Click **"Delete"** to remove

#### Keyboard Shortcuts

- **Delete** - Remove selected overlay
- **Escape** - Deselect overlay

#### Overlay List

- View all overlays in the right panel
- Click any overlay to select it
- Quick edit/delete buttons on each item
- Shows position coordinates

### Tips

- **Multiple overlays:** Create as many as needed
- **Layering:** Use Front/Back buttons to control overlap
- **Transparency:** Adjust opacity for subtle effects
- **Precision:** Position coordinates shown in control panel
- **Persistence:** All overlays saved to database automatically

## 🛠️ Development

### Project Structure

```
├── backend/
│   ├── app/
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   └── utils/          # Utilities
│   ├── streams/            # HLS output directory
│   ├── config.py           # Configuration
│   ├── run.py              # Flask entry point
│   └── rtsp_to_hls.py      # RTSP converter
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── types/          # TypeScript types
│   └── package.json
└── README.md
```

### Tech Stack

**Backend:**
- Flask (Python web framework)
- MongoDB (Database)
- Flask-CORS (CORS handling)
- FFmpeg (Video processing)

**Frontend:**
- React + TypeScript
- Vite (Build tool)
- TailwindCSS (Styling)
- HLS.js (Video playback)
- React-Draggable & Re-resizable (Overlay interaction)

## 🐛 Troubleshooting

### CORS Errors
- Ensure Flask backend is running on port 8080
- Check CORS_ORIGINS in backend config
- Verify frontend is accessing correct API URL

### Stream Not Playing
- Check if RTSP to HLS converter is running
- Verify RTSP URL is accessible
- Check FFmpeg is installed: `ffmpeg -version`
- Look for `.m3u8` and `.ts` files in `backend/streams/`

### MongoDB Connection Failed
- Ensure MongoDB is running: `brew services start mongodb-community` (macOS)
- Check MONGO_URI in backend config
- Verify MongoDB port (default: 27017)

### Overlays Not Saving
- Check backend console for errors
- Verify MongoDB connection
- Check browser console for API errors

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
