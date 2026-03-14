from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    JWT_SECRET_KEY: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 60

    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "omegaweb"

    TM_FUZZY_THRESHOLD: int = 75
    AI_PROVIDER: str = "openai"
    OPENAI_API_KEY: str = ""

    FRONTEND_URL: str = "http://localhost:5173"

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
