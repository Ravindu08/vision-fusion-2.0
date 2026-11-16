from typing import List, Union
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
DB_FILE = BACKEND_DIR / "vision_fusion.db"
DEFAULT_SQLITE_URL = f"sqlite:///{DB_FILE.as_posix()}"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=[str(BACKEND_DIR / ".env"), ".env"],
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )

    PROJECT_NAME: str = "Vision Fusion 2.0 – Tech Career Week"
    API_V1_STR: str = "/api/v1"
    
    # Security & Tokens
    SECRET_KEY: str = "visionfusion2_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Database
    DATABASE_URL: str = DEFAULT_SQLITE_URL
    SQLITE_FALLBACK_URL: str = DEFAULT_SQLITE_URL

    @field_validator("DATABASE_URL", "SQLITE_FALLBACK_URL", mode="after")
    def resolve_sqlite_path(cls, v: str) -> str:
        if v.startswith("sqlite:///./"):
            relative_name = v.replace("sqlite:///./", "")
            resolved = (BACKEND_DIR / relative_name).as_posix()
            return f"sqlite:///{resolved}"
        return v

    # Gamification (5 Events x 100 XP = 500 XP total; Certificate at >= 350 XP)
    TOTAL_POSSIBLE_XP: int = 500
    CERTIFICATE_THRESHOLD_PERCENT: float = 70.0

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        return [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3000",
        ]


settings = Settings()
