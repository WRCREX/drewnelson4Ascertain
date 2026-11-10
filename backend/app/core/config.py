from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central app configuration, sourced from environment variables."""

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/healthcare"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    seed_on_startup: bool = True

    @property
    def sync_database_url(self) -> str:
        """Alembic runs sync, so swap the asyncpg driver for psycopg2."""
        return self.database_url.replace("+asyncpg", "+psycopg2")


settings = Settings()
