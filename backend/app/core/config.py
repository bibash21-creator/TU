import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Nova Oracle"
    VERSION: str = "2.2.0"
    DEBUG: bool = True
    PORT: int = 9099
    HOST: str = "0.0.0.0"

    # Security
    ADMIN_USER: str
    ADMIN_PASS: str
    ADMIN_TOKEN: str
    SECRET_KEY: str

    # Storage
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    RESULTS_FILE: str = os.path.join(BASE_DIR, "results.toml")
    DATABASE_URL: str = "sqlite:///./results.db"  # Default to SQLite for local development

    # CORS
    ALLOWED_ORIGINS: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "https://result-query-tool.vercel.app"
    ]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Global Settings Instance
settings = Settings()
