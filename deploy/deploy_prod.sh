#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Использование: $0 <domain> <email> [repo_dir]"
  echo "Пример: $0 kontrast-shop.ru you@example.com /srv/kontrast"
  exit 1
fi

DOMAIN="$1"
EMAIL="$2"
REPO_DIR="${3:-/srv/kontrast}"
PROJECT_DIR="$REPO_DIR/kontrast-main"

# Проверка ОС (предполагается Debian/Ubuntu)
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" != "ubuntu" && "$ID" != "debian" && "$ID" != "raspbian" ]]; then
    echo "Скрипт протестирован для Debian/Ubuntu. Продолжайте на свой страх и риск." >&2
  fi
fi

echo "1) Установка Docker и Certbot (если нужно)"
if ! command -v docker >/dev/null 2>&1; then
  sudo apt update
  sudo apt install -y ca-certificates curl gnupg lsb-release
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
  sudo apt update
  sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
  sudo usermod -aG docker "$USER"
else
  echo "Docker уже установлен"
fi

if ! command -v certbot >/dev/null 2>&1; then
  sudo apt update
  sudo apt install -y certbot
else
  echo "certbot уже установлен"
fi

echo "2) Клонируем репозиторий в $REPO_DIR (если ещё не клонирован)"
if [ ! -d "$PROJECT_DIR" ]; then
  read -p "Укажите git-репозиторий (или нажмите Enter чтобы пропустить клонирование): " GIT_URL
  if [ -n "$GIT_URL" ]; then
    sudo mkdir -p "$REPO_DIR"
    sudo chown "$USER":"$USER" "$REPO_DIR"
    git clone "$GIT_URL" "$PROJECT_DIR"
  else
    echo "Ожидаю, что вы скопировали проект в $PROJECT_DIR вручную." 
    exit 1
  fi
fi

cd "$PROJECT_DIR"

echo "3) Подготовка .env.prod"
if [ ! -f .env.prod ]; then
  cp .env.prod.example .env.prod
  # Генерируем секретный ключ, если не задан
  if ! grep -q DJANGO_SECRET_KEY .env.prod; then
    SECRET=$(openssl rand -hex 32)
    echo "DJANGO_SECRET_KEY=$SECRET" >> .env.prod
  fi
  # Обновим хосты
  sed -i "s/^DJANGO_ALLOWED_HOSTS=.*/DJANGO_ALLOWED_HOSTS=$DOMAIN,127.0.0.1/" .env.prod || true
  sed -i "s/^DJANGO_DEBUG=.*/DJANGO_DEBUG=False/" .env.prod || true
  echo ".env.prod создан. Отредактируйте вручную, если нужно: $PROJECT_DIR/.env.prod"
else
  echo ".env.prod уже существует"
fi

echo "4) Получение SSL через certbot (standalone). Порт 80 должен быть свободен."
# Остановим локальный nginx/systemd service, если он слушает 80
if sudo lsof -i:80 -P -n | grep LISTEN >/dev/null 2>&1; then
  echo "Найден процесс, слушающий порт 80. Попытка его остановить (если это systemd-сервис nginx)")
  sudo systemctl stop nginx || true
fi

sudo certbot certonly --standalone --agree-tos --email "$EMAIL" -d "$DOMAIN" -d "www.$DOMAIN"

echo "5) Запуск Docker Compose"
sudo docker compose up -d --build

echo "6) Миграции и сбор статики"
sudo docker compose exec backend python manage.py migrate --noinput || true
sudo docker compose exec backend python manage.py collectstatic --noinput || true

echo "7) Открываем порты в ufw (если есть)"
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw reload || true
fi

echo "8) Включаем автоматическое продление сертификатов (systemd timer)"
if systemctl list-timers | grep certbot >/dev/null 2>&1; then
  sudo systemctl enable --now certbot.timer || true
fi

echo "Готово. Проверьте сайт: https://$DOMAIN"
