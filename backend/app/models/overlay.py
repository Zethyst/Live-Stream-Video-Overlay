from bson import ObjectId
from datetime import datetime
from app import db

class Overlay:
    """Overlay model for managing video overlays"""
    
    collection = db.overlays if db is not None else None
    
    @staticmethod
    def create(data):
        """Create a new overlay"""
        overlay = {
            'type': data.get('type'),  # 'text' or 'image'
            'content': data.get('content'),  # text string or image URL
            'position': {
                'x': data.get('position', {}).get('x', 0),
                'y': data.get('position', {}).get('y', 0)
            },
            'size': {
                'width': data.get('size', {}).get('width', 100),
                'height': data.get('size', {}).get('height', 50)
            },
            'style': data.get('style', {}), 
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = Overlay.collection.insert_one(overlay)
        overlay['_id'] = str(result.inserted_id)
        return overlay
    
    @staticmethod
    def get_all():
        """Get all overlays"""
        overlays = list(Overlay.collection.find())
        for overlay in overlays:
            overlay['_id'] = str(overlay['_id'])
        return overlays
    
    @staticmethod
    def get_by_id(overlay_id):
        """Get overlay by ID"""
        try:
            overlay = Overlay.collection.find_one({'_id': ObjectId(overlay_id)})
            if overlay:
                overlay['_id'] = str(overlay['_id'])
            return overlay
        except:
            return None
    
    @staticmethod
    def update(overlay_id, data):
        """Update an overlay"""
        try:
            update_data = {
                'updated_at': datetime.utcnow()
            }
            
            if 'type' in data:
                update_data['type'] = data['type']
            if 'content' in data:
                update_data['content'] = data['content']
            if 'position' in data:
                update_data['position'] = data['position']
            if 'size' in data:
                update_data['size'] = data['size']
            if 'style' in data:
                update_data['style'] = data['style']
            
            result = Overlay.collection.update_one(
                {'_id': ObjectId(overlay_id)},
                {'$set': update_data}
            )
            
            return result.modified_count > 0
        except:
            return False
    
    @staticmethod
    def delete(overlay_id):
        """Delete an overlay"""
        try:
            result = Overlay.collection.delete_one({'_id': ObjectId(overlay_id)})
            return result.deleted_count > 0
        except:
            return False