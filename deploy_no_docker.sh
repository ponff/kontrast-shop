#!/bin/bash

###############################################################################
# Скрипт автоматического развертывания Kontrast Shop БЕЗ Docker
# Для Ubuntu 20.04+ / Debian 11+
###############################################################################

set -e  # Остановить при любой ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Конфигурация
DOMAIN="kontrast-shop.ru"
WWW_DOMAIN="www.kontrast-shop.ru"
EMAIL="admin@kontrast-shop.ru"  # Для Let's Encrypt уведомлений
APP_USER="kontrast"
APP_DIR="/opt/kontrast-shop"
LOG_DIR="/var/log/kontrast-shop"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Kontrast Shop - Развертывание${NC}"
echo -e "${BLUE}   (БЕЗ Docker)${NC}"
echo -e "${BLUE}========================================${NC}"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Запустите скрипт с правами root: sudo ./deploy_no_docker.sh${NC}"
    exit 1
fi

# Определить текущий IP
SERVER_IP=$(curl -s ifconfig.me || echo "unknown")
echo -e "${BLUE}🌐 IP сервера: ${SERVER_IP}${NC}"

# Запросить подтверждение
echo -e "\n${YELLOW}⚠️  Этот скрипт установит и настроит:${NC}"
echo -e "   • Python 3.10+, Node.js 20.x, Nginx, Certbot"
echo -e "   • Приложение в $APP_DIR"
echo -e "   • SSL сертификат для $DOMAIN"
echo -e "   • Systemd сервисы для автозапуска"
echo ""
read -p "Продолжить? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Отменено пользователем${NC}"
    exit 0
fi

###############################################################################
# 1. УСТАНОВКА СИСТЕМНЫХ ЗАВИСИМОСТЕЙ
###############################################################################
echo -e "\n${BLUE}📦 Шаг 1/10: Установка системных зависимостей...${NC}"

apt update
apt upgrade -y
apt install -y software-properties-common curl wget git build-essential

# Python 3.10+
echo -e "${YELLOW}   Установка Python 3.10+...${NC}"
apt install -y python3 python3-pip python3-venv python3-dev
python3 --version

# Node.js 20.x
echo -e "${YELLOW}   Установка Node.js 20.x...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
fi
node --version
npm --version

# Nginx
echo -e "${YELLOW}   Установка Nginx...${NC}"
apt install -y nginx
systemctl enable nginx
systemctl start nginx

# Certbot
echo -e "${YELLOW}   Установка Certbot...${NC}"
apt install -y certbot
certbot --version

# UFW Firewall
echo -e "${YELLOW}   Установка UFW...${NC}"
apt install -y ufw

echo -e "${GREEN}✅ Системные зависимости установлены${NC}"

###############################################################################
# 2. СОЗДАНИЕ ПОЛЬЗОВАТЕЛЯ И ДИРЕКТОРИЙ
###############################################################################
echo -e "\n${BLUE}👤 Шаг 2/10: Создание пользователя и директорий...${NC}"

# Создать пользователя kontrast
if ! id "$APP_USER" &>/dev/null; then
    useradd -r -s /bin/bash -d "$APP_DIR" -m "$APP_USER"
    usermod -aG www-data "$APP_USER"
    echo -e "${GREEN}✅ Пользователь $APP_USER создан${NC}"
else
    echo -e "${YELLOW}⚠️  Пользователь $APP_USER уже существует${NC}"
fi

# Создать директорию для логов
mkdir -p "$LOG_DIR"
chown -R "$APP_USER:www-data" "$LOG_DIR"
chmod 755 "$LOG_DIR"

echo -e "${GREEN}✅ Структура директорий создана${NC}"

###############################################################################
# 3. ПОДГОТОВКА КОДА ПРИЛОЖЕНИЯ
###############################################################################
echo -e "\n${BLUE}📥 Шаг 3/10: Подготовка кода приложения...${NC}"

# Если скрипт запущен из репозитория, копируем код
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ -d "$SCRIPT_DIR/.git" ]; then
    echo -e "${YELLOW}   Копирование кода из текущей директории...${NC}"

    # Если целевая директория существует, делаем backup
    if [ -d "$APP_DIR" ] && [ "$(ls -A $APP_DIR)" ]; then
        BACKUP_DIR="${APP_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
        echo -e "${YELLOW}   Создание backup: $BACKUP_DIR${NC}"
        mv "$APP_DIR" "$BACKUP_DIR"
    fi

    # Копируем код
    mkdir -p "$APP_DIR"
    cp -r "$SCRIPT_DIR"/* "$APP_DIR/" 2>/dev/null || true
    cp -r "$SCRIPT_DIR"/.git* "$APP_DIR/" 2>/dev/null || true
    chown -R "$APP_USER:www-data" "$APP_DIR"
    echo -e "${GREEN}✅ Код скопирован${NC}"
else
    echo -e "${YELLOW}   Клонирование из Git (если нужно, укажите URL репозитория)${NC}"
    echo -e "${RED}   Или скопируйте код вручную в $APP_DIR${NC}"
fi

cd "$APP_DIR"

###############################################################################
# 4. НАСТРОЙКА BACKEND (Django)
###############################################################################
echo -e "\n${BLUE}🐍 Шаг 4/10: Настройка Backend (Django)...${NC}"

cd "$APP_DIR/back"

# Создать виртуальное окружение
echo -e "${YELLOW}   Создание виртуального окружения Python...${NC}"
sudo -u "$APP_USER" python3 -m venv .venv
echo -e "${GREEN}✅ Виртуальное окружение создано${NC}"

# Установить зависимости
echo -e "${YELLOW}   Установка Python зависимостей...${NC}"
sudo -u "$APP_USER" .venv/bin/pip install --upgrade pip
sudo -u "$APP_USER" .venv/bin/pip install -r requirements.txt
echo -e "${GREEN}✅ Python зависимости установлены${NC}"

# Создать .env.prod файл
echo -e "${YELLOW}   Создание .env.prod...${NC}"
if [ ! -f ".env.prod" ]; then
    SECRET_KEY=$(python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())")

    cat > .env.prod <<EOF
# Django настройки
DJANGO_SECRET_KEY=$SECRET_KEY
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=$DOMAIN,$WWW_DOMAIN,$SERVER_IP,127.0.0.1,localhost

# Yandex Kassa (замените на реальные значения)
YOO_KASSA_SHOP_ID=1372207
YOO_KASSA_SECRET_KEY=test_xvhVM9NvcVYapkEOOw54p7Iqc4F9TpgUgFSfwfFtzdM
YOO_KASSA_RETURN_URL=https://$DOMAIN/

# Telegram бот (замените на реальные значения)
TELEGRAM_BOT_TOKEN=8760492400:AAEiZQfgoiHdsepZ2GfCONmkgewKsslRhTM
TELEGRAM_SECRET_CODE=0000
EOF

    chown "$APP_USER:www-data" .env.prod
    chmod 600 .env.prod
    echo -e "${GREEN}✅ .env.prod создан${NC}"
else
    echo -e "${YELLOW}⚠️  .env.prod уже существует, пропускаем${NC}"
fi

# Выполнить миграции
echo -e "${YELLOW}   Применение миграций Django...${NC}"
sudo -u "$APP_USER" .venv/bin/python manage.py migrate --noinput
echo -e "${GREEN}✅ Миграции применены${NC}"

# Собрать статику
echo -e "${YELLOW}   Сборка статических файлов...${NC}"
sudo -u "$APP_USER" .venv/bin/python manage.py collectstatic --noinput
echo -e "${GREEN}✅ Статика собрана${NC}"

# Загрузить начальные данные
echo -e "${YELLOW}   Загрузка начальных данных...${NC}"
sudo -u "$APP_USER" .venv/bin/python manage.py load_initial_data || echo -e "${YELLOW}⚠️  Пропущено (команда может не быть доступна)${NC}"

# Создать суперпользователя
echo -e "${YELLOW}   Создание суперпользователя admin...${NC}"
sudo -u "$APP_USER" .venv/bin/python manage.py shell <<EOF || true
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin')
    print('Суперпользователь создан: admin/admin')
else:
    print('Суперпользователь admin уже существует')
EOF

echo -e "${GREEN}✅ Backend настроен${NC}"

###############################################################################
# 5. НАСТРОЙКА FRONTEND (Next.js)
###############################################################################
echo -e "\n${BLUE}⚛️  Шаг 5/10: Настройка Frontend (Next.js)...${NC}"

cd "$APP_DIR/front"

# Создать .env.production
echo -e "${YELLOW}   Создание .env.production...${NC}"
cat > .env.production <<EOF
NEXT_PUBLIC_API_URL=https://$DOMAIN/api/
EOF
chown "$APP_USER:www-data" .env.production
echo -e "${GREEN}✅ .env.production создан${NC}"

# Установить зависимости
echo -e "${YELLOW}   Установка Node.js зависимостей...${NC}"
sudo -u "$APP_USER" npm install --production
echo -e "${GREEN}✅ Node.js зависимости установлены${NC}"

# Собрать production build
echo -e "${YELLOW}   Сборка Next.js приложения...${NC}"
sudo -u "$APP_USER" npm run build
echo -e "${GREEN}✅ Frontend собран${NC}"

###############################################################################
# 6. НАСТРОЙКА SYSTEMD СЕРВИСОВ
###############################################################################
echo -e "\n${BLUE}⚙️  Шаг 6/10: Настройка systemd сервисов...${NC}"

# Backend service
echo -e "${YELLOW}   Создание kontrast-backend.service...${NC}"
cat > /etc/systemd/system/kontrast-backend.service <<EOF
[Unit]
Description=Kontrast Shop Django Backend
After=network.target

[Service]
Type=notify
User=$APP_USER
Group=www-data
WorkingDirectory=$APP_DIR/back
Environment="PATH=$APP_DIR/back/.venv/bin"
EnvironmentFile=$APP_DIR/back/.env.prod
ExecStart=$APP_DIR/back/.venv/bin/gunicorn \\
    back.wsgi:application \\
    --bind 127.0.0.1:8000 \\
    --workers 4 \\
    --timeout 60 \\
    --access-logfile $LOG_DIR/backend-access.log \\
    --error-logfile $LOG_DIR/backend-error.log \\
    --log-level info
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Frontend service
echo -e "${YELLOW}   Создание kontrast-frontend.service...${NC}"
cat > /etc/systemd/system/kontrast-frontend.service <<EOF
[Unit]
Description=Kontrast Shop Next.js Frontend
After=network.target

[Service]
Type=simple
User=$APP_USER
Group=www-data
WorkingDirectory=$APP_DIR/front
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
StandardOutput=append:$LOG_DIR/frontend.log
StandardError=append:$LOG_DIR/frontend-error.log
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузить systemd
systemctl daemon-reload

# Включить автозапуск
systemctl enable kontrast-backend
systemctl enable kontrast-frontend

echo -e "${GREEN}✅ Systemd сервисы настроены${NC}"

###############################################################################
# 7. ПОЛУЧЕНИЕ SSL СЕРТИФИКАТА
###############################################################################
echo -e "\n${BLUE}🔒 Шаг 7/10: Получение SSL сертификата...${NC}"

# Проверить, существует ли уже сертификат
if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    echo -e "${YELLOW}   Остановка Nginx для получения сертификата...${NC}"
    systemctl stop nginx

    echo -e "${YELLOW}   Запрос сертификата Let's Encrypt...${NC}"
    certbot certonly --standalone \
        -d "$DOMAIN" \
        -d "$WWW_DOMAIN" \
        --non-interactive \
        --agree-tos \
        --email "$EMAIL" || {
            echo -e "${RED}❌ Ошибка получения SSL сертификата${NC}"
            echo -e "${YELLOW}💡 Проверьте:${NC}"
            echo -e "   1. DNS записи A для $DOMAIN и $WWW_DOMAIN указывают на $SERVER_IP"
            echo -e "   2. Порты 80 и 443 открыты в файрволе"
            echo -e "   3. Домен доступен из интернета"
            exit 1
        }

    echo -e "${GREEN}✅ SSL сертификат получен${NC}"

    # Настроить автоматическое обновление
    echo -e "${YELLOW}   Настройка автообновления сертификата...${NC}"
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | crontab -
else
    echo -e "${YELLOW}⚠️  SSL сертификат уже существует, пропускаем${NC}"
fi

###############################################################################
# 8. НАСТРОЙКА NGINX
###############################################################################
echo -e "\n${BLUE}🌐 Шаг 8/10: Настройка Nginx...${NC}"

# Копировать конфигурацию
echo -e "${YELLOW}   Создание конфигурации Nginx...${NC}"
cp "$APP_DIR/nginx/nginx.conf.no-docker" /etc/nginx/sites-available/kontrast-shop

# Создать симлинк
ln -sf /etc/nginx/sites-available/kontrast-shop /etc/nginx/sites-enabled/

# Удалить default конфигурацию
rm -f /etc/nginx/sites-enabled/default

# Проверить конфигурацию
nginx -t || {
    echo -e "${RED}❌ Ошибка в конфигурации Nginx${NC}"
    exit 1
}

echo -e "${GREEN}✅ Nginx настроен${NC}"

###############################################################################
# 9. ЗАПУСК СЕРВИСОВ
###############################################################################
echo -e "\n${BLUE}🚀 Шаг 9/10: Запуск сервисов...${NC}"

# Запустить backend
echo -e "${YELLOW}   Запуск backend...${NC}"
systemctl start kontrast-backend
sleep 3

# Запустить frontend
echo -e "${YELLOW}   Запуск frontend...${NC}"
systemctl start kontrast-frontend
sleep 3

# Запустить Nginx
echo -e "${YELLOW}   Запуск Nginx...${NC}"
systemctl start nginx

echo -e "${GREEN}✅ Сервисы запущены${NC}"

###############################################################################
# 10. НАСТРОЙКА ФАЙРВОЛА
###############################################################################
echo -e "\n${BLUE}🔥 Шаг 10/10: Настройка файрвола...${NC}"

# Настроить UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS

echo "y" | ufw enable || true

echo -e "${GREEN}✅ Файрвол настроен${NC}"

###############################################################################
# ПРОВЕРКА СТАТУСА
###############################################################################
echo -e "\n${BLUE}🔍 Проверка статуса сервисов...${NC}"
sleep 2

BACKEND_STATUS=$(systemctl is-active kontrast-backend)
FRONTEND_STATUS=$(systemctl is-active kontrast-frontend)
NGINX_STATUS=$(systemctl is-active nginx)

echo -e "Backend:  ${BACKEND_STATUS}"
echo -e "Frontend: ${FRONTEND_STATUS}"
echo -e "Nginx:    ${NGINX_STATUS}"

###############################################################################
# ЗАВЕРШЕНИЕ
###############################################################################
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Развертывание завершено успешно!${NC}"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${BLUE}📋 Информация о доступе:${NC}"
echo -e "   🌐 Сайт:      https://$DOMAIN"
echo -e "   🔧 Админка:   https://$DOMAIN/admin"
echo -e "   👤 Логин:     admin"
echo -e "   🔑 Пароль:    admin"
echo -e "   📚 API Docs:  https://$DOMAIN/swagger"

echo -e "\n${YELLOW}⚠️  ВАЖНО: Смените пароль администратора!${NC}"

echo -e "\n${BLUE}💡 Полезные команды:${NC}"
echo -e "   Статус:       systemctl status kontrast-backend kontrast-frontend"
echo -e "   Логи:         journalctl -u kontrast-backend -f"
echo -e "   Перезапуск:   systemctl restart kontrast-backend kontrast-frontend"
echo -e "   Обновление:   cd $APP_DIR && sudo ./update_no_docker.sh"

echo -e "\n${BLUE}📁 Важные пути:${NC}"
echo -e "   Приложение:   $APP_DIR"
echo -e "   Логи:         $LOG_DIR"
echo -e "   Nginx config: /etc/nginx/sites-available/kontrast-shop"
echo -e "   Systemd:      /etc/systemd/system/kontrast-*.service"

echo -e "\n${GREEN}🎉 Готово! Сайт доступен по адресу https://$DOMAIN${NC}"
