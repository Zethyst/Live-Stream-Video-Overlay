#!/usr/bin/env python3
"""
RTSP to HLS Converter
Converts an RTSP stream to HLS format for web playback
"""

import subprocess
import sys
import os
from config import Config

def convert_rtsp_to_hls(rtsp_url, output_dir=None):
    """
    Convert RTSP stream to HLS format
    
    Args:
        rtsp_url: RTSP stream URL (e.g., rtsp://localhost:8554/mystream)
        output_dir: Output directory for HLS files (default: from config)
    """
    if output_dir is None:
        output_dir = Config.HLS_OUTPUT_DIR
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'stream.m3u8')
    
    # FFmpeg command to convert RTSP to HLS
    ffmpeg_cmd = [
        'ffmpeg',
        '-rtsp_transport', 'tcp',  # Use TCP for RTSP (more reliable)
        '-i', rtsp_url,             # Input RTSP stream
        '-c:v', 'copy',             # Copy video codec (no re-encoding for speed)
        '-c:a', 'aac',              # Convert audio to AAC
        '-f', 'hls',                # Output format: HLS
        '-hls_time', '2',           # Segment duration: 2 seconds
        '-hls_list_size', '10',     # Keep last 10 segments in playlist
        '-hls_flags', 'delete_segments+append_list',  # Delete old segments
        '-hls_segment_filename', os.path.join(output_dir, 'stream%d.ts'),
        output_path
    ]
    
    print(f"🎥 Starting RTSP to HLS conversion...")
    print(f"📥 Input:  {rtsp_url}")
    print(f"📤 Output: {output_path}")
    print(f"🔄 FFmpeg command: {' '.join(ffmpeg_cmd)}\n")
    
    try:
        # Run FFmpeg
        process = subprocess.Popen(
            ffmpeg_cmd,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            universal_newlines=True
        )
        
        print("✅ Conversion started! Press Ctrl+C to stop.\n")
        
        # Stream stderr output (FFmpeg writes logs to stderr)
        for line in process.stderr:
            print(line, end='')
        
        process.wait()
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopping conversion...")
        process.terminate()
        process.wait()
        print("✅ Stopped successfully!")
    except FileNotFoundError:
        print("❌ Error: FFmpeg not found!")
        print("Please install FFmpeg:")
        print("  macOS:   brew install ffmpeg")
        print("  Ubuntu:  sudo apt-get install ffmpeg")
        print("  Windows: Download from https://ffmpeg.org/download.html")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Usage: python rtsp_to_hls.py <rtsp_url>")
        print("\nExample:")
        print("  python rtsp_to_hls.py rtsp://localhost:8554/mystream")
        print("  python rtsp_to_hls.py rtsp://admin:password@192.168.1.100:554/stream")
        sys.exit(1)
    
    rtsp_url = sys.argv[1]
    convert_rtsp_to_hls(rtsp_url)
