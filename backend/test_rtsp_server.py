#!/usr/bin/env python3
"""
Simple RTSP Test Server
Uses a test video file or webcam to create an RTSP stream for testing
Requires: mediamtx (formerly rtsp-simple-server)
"""

import subprocess
import sys
import os

def check_mediamtx():
    """Check if mediamtx is installed"""
    try:
        result = subprocess.run(['which', 'mediamtx'], capture_output=True, text=True)
        return result.returncode == 0
    except:
        return False

def install_instructions():
    """Print installation instructions"""
    print("📦 MediaMTX (RTSP Server) is not installed.")
    print("\nInstallation instructions:")
    print("\n🍎 macOS:")
    print("  brew install mediamtx")
    print("  brew services start mediamtx")
    print("\n🐧 Linux:")
    print("  # Download from: https://github.com/bluenviron/mediamtx/releases")
    print("  wget https://github.com/bluenviron/mediamtx/releases/latest/download/mediamtx_*_linux_amd64.tar.gz")
    print("  tar -xzf mediamtx_*_linux_amd64.tar.gz")
    print("  ./mediamtx")
    print("\n🪟 Windows:")
    print("  # Download from: https://github.com/bluenviron/mediamtx/releases")
    print("  # Extract and run mediamtx.exe")
    print("\n📝 Alternative: Use Docker")
    print("  docker run --rm -it -p 8554:8554 bluenviron/mediamtx")
    print("\n" + "="*60)
    print("\n💡 Quick Test without MediaMTX:")
    print("   Use the 'Demo Stream' button in the web app!")
    print("   Or use any public RTSP stream URL.")

def test_with_ffmpeg():
    """Test by streaming a test pattern using FFmpeg"""
    print("\n🎥 Starting test RTSP stream with FFmpeg...")
    print("📡 Stream will be available at: rtsp://localhost:8554/test")
    print("⏹️  Press Ctrl+C to stop\n")
    
    # FFmpeg command to generate test pattern and stream to RTSP
    cmd = [
        'ffmpeg',
        '-re',
        '-f', 'lavfi',
        '-i', 'testsrc=size=1280x720:rate=30',
        '-f', 'lavfi',
        '-i', 'sine=frequency=1000',
        '-pix_fmt', 'yuv420p',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-f', 'rtsp',
        'rtsp://localhost:8554/test'
    ]
    
    try:
        subprocess.run(cmd)
    except KeyboardInterrupt:
        print("\n\n✅ Stopped test stream")
    except FileNotFoundError:
        print("❌ FFmpeg not found. Please install FFmpeg first.")
        sys.exit(1)

if __name__ == '__main__':
    print("="*60)
    print("🎬 RTSP Test Server Setup")
    print("="*60)
    
    if not check_mediamtx():
        install_instructions()
        print("\n" + "="*60)
        print("\n❓ Do you want to test with FFmpeg test pattern instead? (y/n)")
        choice = input("> ").lower()
        if choice == 'y':
            test_with_ffmpeg()
    else:
        print("\n✅ MediaMTX is installed!")
        print("\n📡 Start MediaMTX with:")
        print("   mediamtx")
        print("\n📹 Then publish a stream to: rtsp://localhost:8554/mystream")
        print("\n💡 Or use FFmpeg to stream a test pattern:")
        print("   python3 test_rtsp_server.py")
