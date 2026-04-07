from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App Configuration
    APP_NAME: str = "AI Resume Platform"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    MONGODB_URL: str = "mongodb://localhost:27017/resume_platform"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # AI APIs
    GROQ_API_KEY: str = "your-groq-api-key"
    DEEPSEEK_API_KEY: str = "your-deepseek-api-key"
    
    # Firebase
    FIREBASE_PROJECT_ID: str = "your-firebase-project-id"
    FIREBASE_PRIVATE_KEY: str = ""
    FIREBASE_WEB_API_KEY: str = "your-firebase-web-api-key"
    FIREBASE_AUTH_DOMAIN: str = "your-project.firebaseapp.com"
    FIREBASE_STORAGE_BUCKET: str = "your-project.firebasestorage.app"
    FIREBASE_MESSAGING_SENDER_ID: str = "your-messaging-sender-id"
    FIREBASE_APP_ID: str = "your-app-id"
    FIREBASE_MEASUREMENT_ID: str = "your-measurement-id"
    
    # CORS
    ALLOWED_ORIGINS: list = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://yourdomain.com"
    ]
    
    # File Upload
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    UPLOAD_DIR: str = "uploads"
    ALLOWED_FILE_TYPES: list = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain"
    ]
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    RATE_LIMIT_BURST: int = 10
    
    class Config:
        env_file = ".env"
        case_sensitive = True


def get_settings() -> Settings:
    return Settings()
