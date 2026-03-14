from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    # Database: choose backend and connection. ORM used when backend is "sql".
    DATABASE_BACKEND: str = "mongodb"  # "mongodb" | "sql"
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "omegaweb"
    # For DATABASE_BACKEND=sql: use SQLite or PostgreSQL (e.g. postgresql+asyncpg://user:pass@localhost/db)
    DATABASE_URL: str = "sqlite+aiosqlite:///./omegaweb.db"

    TM_FUZZY_THRESHOLD: int = 75

    # AI translation: engine-agnostic. Set AI_PROVIDER to the engine name and the matching API key.
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"  # optional override
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-haiku-20241022"  # optional override

    FRONTEND_URL: str = "http://localhost:5173"

    # Optional: override path to seed JSON files (for any DB). Default: backend/data/seeds
    SEEDS_DIR: str | None = None

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
