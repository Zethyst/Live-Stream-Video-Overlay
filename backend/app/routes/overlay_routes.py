from flask import Blueprint, request, jsonify
from app.models.overlay import Overlay

overlay_bp = Blueprint('overlays', __name__)

@overlay_bp.route('/overlays', methods=['GET'])
def get_overlays():
    """Get all overlays"""
    try:
        overlays = Overlay.get_all()
        return jsonify({
            'success': True,
            'data': overlays,
            'count': len(overlays)
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@overlay_bp.route('/overlays/<overlay_id>', methods=['GET'])
def get_overlay(overlay_id):
    """Get a specific overlay"""
    overlay = Overlay.get_by_id(overlay_id)
    
    if not overlay:
        return jsonify({
            'success': False,
            'error': 'Overlay not found'
        }), 404
    
    return jsonify({
        'success': True,
        'data': overlay
    }), 200

@overlay_bp.route('/overlays', methods=['POST'])
def create_overlay():
    """Create a new overlay"""
    try:
        data = request.get_json()
        
        # Validation
        if not data.get('type') or data['type'] not in ['text', 'image']:
            return jsonify({
                'success': False,
                'error': 'Invalid overlay type. Must be "text" or "image"'
            }), 400
        
        if not data.get('content'):
            return jsonify({
                'success': False,
                'error': 'Content is required'
            }), 400
        
        overlay = Overlay.create(data)
        
        return jsonify({
            'success': True,
            'data': overlay,
            'message': 'Overlay created successfully'
        }), 201
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@overlay_bp.route('/overlays/<overlay_id>', methods=['PUT'])
def update_overlay(overlay_id):
    """Update an overlay"""
    try:
        data = request.get_json()
        
        success = Overlay.update(overlay_id, data)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Overlay not found or update failed'
            }), 404
        
        updated_overlay = Overlay.get_by_id(overlay_id)
        
        return jsonify({
            'success': True,
            'data': updated_overlay,
            'message': 'Overlay updated successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@overlay_bp.route('/overlays/<overlay_id>', methods=['DELETE'])
def delete_overlay(overlay_id):
    """Delete an overlay"""
    try:
        success = Overlay.delete(overlay_id)
        
        if not success:
            return jsonify({
                'success': False,
                'error': 'Overlay not found or delete failed'
            }), 404
        
        return jsonify({
            'success': True,
            'message': 'Overlay deleted successfully'
        }), 200
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500