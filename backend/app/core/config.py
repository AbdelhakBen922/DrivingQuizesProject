"""Application settings loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:postgres@localhost:5432/drivingquiz"
    app_name: str = "Driving Quiz API"
    secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    data_dir_path: str = "data"  # Base directory where quiz assets (images) live
    backend_url: str = "http://localhost:8001"  # Backend base URL for constructing absolute URLs
    uploads_dir_path: str = "uploads"  # Base directory for uploaded assets (avatars, etc.)

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="allow")


settings = Settings()
