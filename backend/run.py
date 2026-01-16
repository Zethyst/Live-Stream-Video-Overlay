from app import create_app
from config import Config

app = create_app()

if __name__ == '__main__':
    print(f"\n🚀 Starting Flask server on http://{Config.HOST}:{Config.PORT}")
    print(f"📊 MongoDB: {Config.MONGO_URI}")
    print(f"🌐 CORS Origins: {Config.CORS_ORIGINS}\n")
    
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=True
    )