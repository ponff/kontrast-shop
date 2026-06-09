#!/usr/bin/env bash
set -e

# Интерактивный скрипт для создания back/.env.prod и front/.env.production
# Запуск: sudo ./scripts/setup_env.sh или от обычного пользователя (файлы создаются в репозитории)

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACK_DIR="$REPO_DIR/back"
FRONT_DIR="$REPO_DIR/front"
ENV_FILE="$BACK_DIR/.env.prod"
FRONT_ENV_FILE="$FRONT_DIR/.env.production"

echo "Создание/обновление файлов окружения для Kontrast Shop"

read -p "Домен приложения (например kontrast-shop.ru): " DOMAIN
read -p "Доп. хосты через запятую (оставьте пустым для localhost): " EXTRA_HOSTS

if [ -z "$DOMAIN" ]; then
  echo "Домен обязателен. Отмена."
  exit 1
fi

# Собираем ALLOWED_HOSTS
ALLOWED_HOSTS="$DOMAIN,www.$DOMAIN"
if [ -n "$EXTRA_HOSTS" ]; then
  ALLOWED_HOSTS=\"$ALLOWED_HOSTS,$EXTRA_HOSTS\"
fi

# Генерация DJANGO_SECRET_KEY
if command -v python3 >/dev/null 2>&1; then
  DJANGO_SECRET_KEY=$(python3 - <<'PY'
from django.core.management.utils import get_random_secret_key
print(get_random_secret_key())
PY
)
else
  DJANGO_SECRET_KEY=$(openssl rand -hex 32 || head -c 50 /dev/urandom | base64)
fi

read -p "YooKassa shop id (или Enter чтобы оставить пустым): " YOO_ID
read -p "YooKassa secret (или Enter чтобы оставить пустым): " YOO_SECRET
read -p "Telegram bot token (или Enter чтобы оставить пустым): " TELEGRAM_TOKEN
read -p "Telegram secret code (или Enter чтобы оставить пустым): " TELEGRAM_SECRET

if [ -f "$ENV_FILE" ]; then
  read -p "$ENV_FILE уже существует. Перезаписать? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Оставляю существующий $ENV_FILE"
  else
    OVERWRITE=true
  fi
  unset REPLY
else
  OVERWRITE=true
fi

if [ "$OVERWRITE" = true ]; then
  cat > "$ENV_FILE" <<EOF
# Django настройки
DJANGO_SECRET_KEY=$DJANGO_SECRET_KEY
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=$ALLOWED_HOSTS

# Yandex Kassa (оставьте пустыми или заполните значения)
YOO_KASSA_SHOP_ID=${YOO_ID}
YOO_KASSA_SECRET_KEY=${YOO_SECRET}
YOO_KASSA_RETURN_URL=https://$DOMAIN/

# Telegram бот
TELEGRAM_BOT_TOKEN=${TELEGRAM_TOKEN}
TELEGRAM_SECRET_CODE=${TELEGRAM_SECRET}
EOF
  echo "Файл создан: $ENV_FILE"
  chmod 600 "$ENV_FILE" || true
fi

# Frontend .env.production
if [ -f "$FRONT_ENV_FILE" ]; then
  read -p "$FRONT_ENV_FILE уже существует. Перезаписать? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Оставляю существующий $FRONT_ENV_FILE"
  else
    FRONT_OVERWRITE=true
  fi
  unset REPLY
else
  FRONT_OVERWRITE=true
fi

if [ "$FRONT_OVERWRITE" = true ]; then
  cat > "$FRONT_ENV_FILE" <<EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api/
EOF
  echo "Файл создан: $FRONT_ENV_FILE"
fi

echo "Готово. Убедитесь, что файлы защищены и не закоммичены в git."
