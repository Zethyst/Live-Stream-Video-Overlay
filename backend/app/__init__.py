from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
from config import Config
import os

# Initialize MongoDB client
mongo_client = None
db = None

def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": config_class.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize MongoDB
    global mongo_client, db
    try:
        mongo_client = MongoClient(app.config['MONGO_URI'])
        db = mongo_client.get_database()
        print(f"✓ Connected to MongoDB: {db.name}")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        raise
    
    # Create HLS output directory
    os.makedirs(app.config['HLS_OUTPUT_DIR'], exist_ok=True)
    
    # Register blueprints
    from app.routes.overlay_routes import overlay_bp
    from app.routes.stream_routes import stream_bp
    app.register_blueprint(overlay_bp, url_prefix='/api')
    app.register_blueprint(stream_bp)
    
    # Health check route
    @app.route('/health')
    def health():
        return {'status': 'healthy', 'database': 'connected'}, 200
    
    return app