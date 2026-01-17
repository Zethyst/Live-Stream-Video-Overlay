from flask import Blueprint, send_from_directory, Response, request, jsonify
from config import Config
from app.utils.stream_manager import stream_manager
import os

stream_bp = Blueprint('stream', __name__)

# Get absolute path to streams directory
STREAMS_DIR = os.path.abspath(Config.HLS_OUTPUT_DIR)

# ============= Stream Management API =============

@stream_bp.route('/api/stream/start', methods=['POST'])
def start_stream():
    """Start RTSP to HLS conversion"""
    data = request.get_json()
    rtsp_url = data.get('rtsp_url')
    
    if not rtsp_url:
        return jsonify({'status': 'error', 'message': 'rtsp_url is required'}), 400
    
    result = stream_manager.start_stream(rtsp_url)
    status_code = 200 if result['status'] == 'success' else 400
    return jsonify(result), status_code

@stream_bp.route('/api/stream/stop', methods=['POST'])
def stop_stream():
    """Stop current stream"""
    result = stream_manager.stop_stream()
    return jsonify(result), 200

@stream_bp.route('/api/stream/status', methods=['GET'])
def get_stream_status():
    """Get current stream status"""
    status = stream_manager.get_status()
    return jsonify(status), 200

@stream_bp.route('/api/stream/restart', methods=['POST'])
def restart_stream():
    """Restart current stream"""
    result = stream_manager.restart_stream()
    status_code = 200 if result['status'] == 'success' else 400
    return jsonify(result), status_code

# ============= HLS File Serving =============

@stream_bp.route('/stream.m3u8')
def serve_m3u8():
    """Serve HLS manifest file with CORS headers"""
    try:
        response = send_from_directory(
            STREAMS_DIR,
            'stream.m3u8',
            mimetype='application/vnd.apple.mpegurl'
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cache-Control'] = 'no-cache'
        return response
    except FileNotFoundError:
        return jsonify({
            'error': 'Stream not found',
            'message': 'No active stream. Start a stream first using /api/stream/start'
        }), 404

@stream_bp.route('/stream<int:segment>.ts')
def serve_segment(segment):
    """Serve HLS video segments with CORS headers"""
    filename = f'stream{segment}.ts'
    try:
        response = send_from_directory(
            STREAMS_DIR,
            filename,
            mimetype='video/MP2T'
        )
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cache-Control'] = 'no-cache'
        return response
    except FileNotFoundError:
        return Response('Segment not found', status=404)

@stream_bp.route('/<path:filename>')
def serve_hls_file(filename):
    """Serve any HLS-related file with CORS headers"""
    if filename.endswith('.m3u8') or filename.endswith('.ts'):
        try:
            response = send_from_directory(STREAMS_DIR, filename)
            response.headers['Access-Control-Allow-Origin'] = '*'
            response.headers['Cache-Control'] = 'no-cache'
            return response
        except FileNotFoundError:
            return Response('File not found', status=404)
    return Response('Not found', status=404)
