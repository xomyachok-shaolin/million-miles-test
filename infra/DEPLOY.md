# Деплой на VPS

## Разовая подготовка сервера

```bash
ssh root@VPS_IP
mkdir -p /opt/mm
cd /opt/mm
# создаём .env на сервере (копируем с .env.example и заменяем значения)
cat > .env <<'EOF'
POSTGRES_USER=carsensor
POSTGRES_PASSWORD=STRONG_PASSWORD
POSTGRES_DB=carsensor
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=HEX_64_BYTES
JWT_ALG=HS256
JWT_EXPIRES_MIN=60
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
NEXT_PUBLIC_API_URL=/api
SCRAPE_INTERVAL_MINUTES=60
SCRAPE_MAX_PAGES=3
SCRAPE_CONCURRENCY=2
GHCR_OWNER=your-github-user-or-org
IMAGE_TAG=latest
EOF
chmod 600 .env
```

## GitHub Secrets (Settings → Secrets → Actions)

| Secret | Значение |
|---|---|
| `VPS_HOST` | IP сервера |
| `VPS_USER` | `root` |
| `VPS_SSH_KEY` | Приватный SSH-ключ (содержимое `~/.ssh/id_ed25519` с dev-машины) |
| `GHCR_USER` | Ваш GitHub username |
| `GHCR_TOKEN` | Personal Access Token с `write:packages,read:packages` |
| `GHCR_OWNER` | Ваш GitHub username (lowercase) |
| `NEXT_PUBLIC_API_URL` | `/api` (для прод) или `https://ваш-домен.tld/api` |

## Let's Encrypt (после первого деплоя)

```bash
ssh root@VPS_IP
cd /opt/mm
docker compose -f docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d example.com -d www.example.com \
  --email you@example.com --agree-tos --non-interactive
# обновите infra/nginx/default.conf — добавьте блок server { listen 443 ssl ... }
docker compose -f docker-compose.prod.yml restart nginx
```
