from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    POSTGRES_USER: str = "carsensor"
    POSTGRES_PASSWORD: str = "carsensor"
    POSTGRES_DB: str = "carsensor"
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432

    SCRAPE_INTERVAL_MINUTES: int = 60
    SCRAPE_MAX_PAGES: int = 5
    SCRAPE_CONCURRENCY: int = 2
    SCRAPE_START_URL: str = "https://www.carsensor.net/usedcar/index.html"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )


settings = Settings()
