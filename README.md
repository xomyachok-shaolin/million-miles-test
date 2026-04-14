# Million Miles — CarSensor Scraper

Мониторинг ассортимента автомобилей с CarSensor.net: воркер-парсер, REST API с JWT, фронтенд на Next.js.

## Стек
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, Alembic, PostgreSQL, Redis
- **Worker**: Playwright, APScheduler, словарь JP→RU
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind, TanStack Query, Zustand
- **Infra**: Docker Compose, Nginx, GitHub Actions (CI/CD в GHCR → VPS)

## Архитектура
Все компоненты изолированы в отдельных контейнерах: `postgres`, `redis`, `api`, `worker`, `web`, `nginx`.

## Локальный запуск
```bash
cp .env.example .env
docker compose up -d --build
# Web:  http://localhost:3000
# API:  http://localhost:8000/docs
```

Логин/пароль для входа: `admin` / `admin123`.

## Деплой
Push в `main` → GitHub Actions собирает образы → пушит в GHCR → SSH на VPS → `docker compose pull && up -d`.
