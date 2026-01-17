"""
Stream Manager - Handles RTSP to HLS conversion
"""

import subprocess
import os
import signal
from typing import Optional
from config import Config

class StreamManager:
    """Manages RTSP to HLS conversion process"""
    
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self.current_rtsp_url: Optional[str] = None
        self.output_dir = Config.HLS_OUTPUT_DIR
        
    def is_running(self) -> bool:
        """Check if conversion process is running"""
        return self.process is not None and self.process.poll() is None
    
    def start_stream(self, rtsp_url: str) -> dict:
        """
        Start RTSP to HLS conversion
        
        Args:
            rtsp_url: RTSP stream URL
            
        Returns:
            dict with status and message
        """
        # Stop existing stream if running
        if self.is_running():
            self.stop_stream()
        
        # Create output directory
        os.makedirs(self.output_dir, exist_ok=True)
        
        output_path = os.path.join(self.output_dir, 'stream.m3u8')
        
        # FFmpeg command
        ffmpeg_cmd = [
            'ffmpeg',
            '-rtsp_transport', 'tcp',
            '-i', rtsp_url,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-f', 'hls',
            '-hls_time', '2',
            '-hls_list_size', '10',
            '-hls_flags', 'delete_segments+append_list',
            '-hls_segment_filename', os.path.join(self.output_dir, 'stream%d.ts'),
            '-loglevel', 'warning',  # Reduce log verbosity
            output_path
        ]
        
        try:
            # Start FFmpeg process
            self.process = subprocess.Popen(
                ffmpeg_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                universal_newlines=True
            )
            
            self.current_rtsp_url = rtsp_url
            
            return {
                'status': 'success',
                'message': 'Stream started successfully',
                'rtsp_url': rtsp_url,
                'hls_url': '/stream.m3u8'
            }
            
        except FileNotFoundError:
            return {
                'status': 'error',
                'message': 'FFmpeg not found. Please install FFmpeg.'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to start stream: {str(e)}'
            }
    
    def stop_stream(self) -> dict:
        """Stop the current stream"""
        if not self.is_running():
            return {
                'status': 'info',
                'message': 'No stream is currently running'
            }
        
        try:
            # Send SIGTERM to gracefully stop FFmpeg
            self.process.terminate()
            self.process.wait(timeout=5)
            
            self.process = None
            self.current_rtsp_url = None
            
            return {
                'status': 'success',
                'message': 'Stream stopped successfully'
            }
            
        except subprocess.TimeoutExpired:
            # Force kill if it doesn't stop gracefully
            self.process.kill()
            self.process = None
            self.current_rtsp_url = None
            
            return {
                'status': 'success',
                'message': 'Stream force stopped'
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': f'Failed to stop stream: {str(e)}'
            }
    
    def get_status(self) -> dict:
        """Get current stream status"""
        return {
            'is_running': self.is_running(),
            'rtsp_url': self.current_rtsp_url,
            'hls_url': '/stream.m3u8' if self.is_running() else None
        }
    
    def restart_stream(self) -> dict:
        """Restart the current stream"""
        if not self.current_rtsp_url:
            return {
                'status': 'error',
                'message': 'No stream to restart'
            }
        
        rtsp_url = self.current_rtsp_url
        self.stop_stream()
        return self.start_stream(rtsp_url)

# Global stream manager instance
stream_manager = StreamManager()
