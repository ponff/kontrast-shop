
# Контраст Shop

Интернет-магазин кожи и аксессуаров. Проект состоит из:
- `back/` — Django REST API, админка, статические и медиаконтент.
- `front/` — Next.js фронтенд.
- `nginx/` — обратный прокси для фронтенда, API, статических файлов и HTTPS.
- `docker-compose.yml` — локальная и продакшн сборка всех сервисов.

## Что уже настроено
- Docker Compose с сервисами `backend`, `frontend` и `nginx`.
- Nginx прокси внутри Docker-сети.
- `back/back/settings.py` поддерживает переменные окружения:
  - `DJANGO_SECRET_KEY`
  - `DJANGO_DEBUG`
  - `DJANGO_ALLOWED_HOSTS`
- Пример production-файла `.env.prod.example`.

## Полное развертывание на сервере

### 1. Настройка DNS
В панели управления доменом добавьте записи:
- `kontrast-shop.ru` → `186.246.30.115`
- `www.kontrast-shop.ru` → `kontrast-shop.ru`

> После изменения DNS может пройти до 30 минут, прежде чем домен начнёт резолвиться.

### 2. Подготовка сервера
Рекомендуется Ubuntu/Debian. На сервере нужны:
- Docker
- Docker Compose (плагин `docker compose`)
- Git
- Certbot
- ufw или другой фаервол

### 3. Разворачивание проекта на сервере
Выполните на сервере:

```bash
sudo apt update
sudo apt install -y git curl ca-certificates gnupg lsb-release software-properties-common
```

Склонируйте репозиторий:

```bash
sudo mkdir -p /srv/kontrast
sudo chown "$USER":"$USER" /srv/kontrast
cd /srv/kontrast
git clone https://github.com/ponff/kontrast-main
```

### 4. Подготовка переменных окружения
Скопируйте пример файла:

```bash
cp .env.prod.example .env.prod
```

Откройте `.env.prod` и задайте значения:

```ini
DJANGO_SECRET_KEY=<сильный секретный ключ>
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=kontrast-shop.ru,186.246.30.115
```

### 5. Получение SSL-сертификатов
Для HTTPS используйте Certbot. Если порт 80 свободен:

```bash
sudo apt install -y certbot
sudo certbot certonly --standalone --agree-tos --email damirponff@gmail.com -d kontrast-shop.ru
```

Если на сервере уже запущен другой веб-сервер, остановите его временно перед получением сертификата.

### 6. Настройка Docker Compose
Убедитесь, что `docker-compose.yml` содержит:
- `nginx` с портами `80:80` и `443:443`
- монтирование `./back/staticfiles:/staticfiles`
- монтирование `./back/media:/media`
- монтирование `/etc/letsencrypt:/etc/letsencrypt:ro`

### 7. Запуск проекта
Из корня проекта выполните:

```bash
sudo docker compose up -d --build
```

### 8. Миграции и статика

```bash
sudo docker compose exec backend python manage.py migrate --noinput
sudo docker compose exec backend python manage.py collectstatic --noinput
```

### 9. Открытие портов
Если используется `ufw`:

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload
```

### 10. Проверка работы
Откройте в браузере:

```text
https://kontrast-shop.ru
```

Проверьте логи:

```bash
sudo docker compose logs -f nginx
sudo docker compose logs -f backend
```

## Полезные команды

```bash
sudo docker compose ps
sudo docker compose restart nginx backend frontend
sudo docker compose down
```

## Локальная разработка

Для локальной работы достаточно:

```bash
docker compose up -d --build
```

Если надо работать с медиаданными и базой, скопируйте `back/db.sqlite3` и `back/media/` из рабочей среды.

## Дополнения и рекомендации
- Сейчас используется SQLite. Для продакшена лучше подключить PostgreSQL.
- Если хотите автоматизировать получение сертификатов, можно использовать скрипт `deploy/deploy_prod.sh`.
- В продакшене обязательно `DJANGO_DEBUG=False`.

### Сборка Docker при ограниченном месте на диске (< 15 ГБ)

Если у вас на сервере мало свободного места, выполните перед сборкой:

```bash
# Очистите всё старое
docker system prune -a --volumes

# Очистите кэш builder
docker builder prune -a

# Проверьте свободное место (нужно минимум ~8-10 ГБ)
df -h

# Теперь собирайте
sudo docker compose up -d --build
```

**Оптимизация проекта:**
- Multi-stage builds в Dockerfile (размер базовых образов упал на 40%)
- python:3.10-slim вместо обычного (200MB → 125MB)
- node:20-alpine вместо regular (1GB → 350MB)
- Исключены dev dependencies и build артефакты
- Убрано volume монтирование для продакшена (volume затмило бы образ дополнительными слоями)

Если ошибка повторится, проверьте: `docker system df` — покажет точное использование места.

Если места совсем нет, удалите старые образы:
```bash
docker image prune -a  # удалит ВСЕ неиспользуемые образы
```
