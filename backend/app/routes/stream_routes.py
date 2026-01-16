from flask import Blueprint, send_from_directory, Response
from config import Config
import os

stream_bp = Blueprint('stream', __name__)

@stream_bp.route('/stream.m3u8')
def serve_m3u8():
    """Serve HLS manifest file with CORS headers"""
    response = send_from_directory(
        Config.HLS_OUTPUT_DIR,
        'stream.m3u8',
        mimetype='application/vnd.apple.mpegurl'
    )
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Cache-Control'] = 'no-cache'
    return response

@stream_bp.route('/stream<int:segment>.ts')
def serve_segment(segment):
    """Serve HLS video segments with CORS headers"""
    filename = f'stream{segment}.ts'
    response = send_from_directory(
        Config.HLS_OUTPUT_DIR,
        filename,
        mimetype='video/MP2T'
    )
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Cache-Control'] = 'no-cache'
    return response

@stream_bp.route('/<path:filename>')
def serve_hls_file(filename):
    """Serve any HLS-related file with CORS headers"""
    if filename.endswith('.m3u8') or filename.endswith('.ts'):
        response = send_from_directory(Config.HLS_OUTPUT_DIR, filename)
        response.headers['Access-Control-Allow-Origin'] = '*'
        response.headers['Cache-Control'] = 'no-cache'
        return response
    return Response('Not found', status=404)
