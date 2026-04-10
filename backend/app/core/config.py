import os
import json
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # App Settings
    PROJECT_NAME: str = "Nova Oracle"
    VERSION: str = "2.2.0"
    DEBUG: bool = True
    PORT: int = int(os.environ.get("PORT", 9099))
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
        "https://turesult.vercel.app"
    ]

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: any) -> list[str]:
        origins = []
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    origins = json.loads(v)
                except json.JSONDecodeError:
                    origins = [i.strip() for i in v.split(",")]
            else:
                origins = [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            origins = v
        else:
            return v
        
        # Permanent Fix: Normalize all origins (remove trailing slashes)
        return [o.rstrip("/") for o in origins]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

# Global Settings Instance with Error Handling
try:
    settings = Settings()
except Exception as e:
    print(f"✧ Oracle Nexus Configuration Error: {e}")
    # In a real validation error, Pydantic would crash the app.
    # We catch it here to ensure the log is actually visible in Render.
    raise e
