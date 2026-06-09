#!/bin/bash
set -e

echo "========================================="
echo "🚀 Развертывание Kontrast Shop"
echo "========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода с цветом
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

# Шаг 1: Обновление системы
print_info "Шаг 1/10: Обновление системы..."
apt update && apt upgrade -y
print_success "Система обновлена"
echo ""

# Шаг 2: Установка базовых зависимостей
print_info "Шаг 2/10: Установка базовых зависимостей..."
apt install -y curl ca-certificates gnupg lsb-release software-properties-common git ufw
print_success "Базовые зависимости установлены"
echo ""

# Шаг 3: Установка Docker
print_info "Шаг 3/10: Установка Docker..."
if command -v docker &> /dev/null; then
    print_warning "Docker уже установлен"
else
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    print_success "Docker установлен"
fi
systemctl enable docker
systemctl start docker
docker --version
echo ""

# Шаг 4: Установка Docker Compose
print_info "Шаг 4/10: Проверка Docker Compose..."
if docker compose version &> /dev/null; then
    print_success "Docker Compose уже установлен"
else
    print_error "Docker Compose не найден"
    exit 1
fi
docker compose version
echo ""

# Шаг 5: Установка Certbot
print_info "Шаг 5/10: Установка Certbot..."
apt install -y certbot
print_success "Certbot установлен"
echo ""

# Шаг 6: Настройка firewall
print_info "Шаг 6/10: Настройка firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
print_success "Firewall настроен"
ufw status
echo ""

# Шаг 7: Создание директории и клонирование проекта
print_info "Шаг 7/10: Клонирование проекта..."
mkdir -p /srv/kontrast
cd /srv/kontrast

if [ -d "kontrast-shop" ]; then
    print_warning "Директория kontrast-shop уже существует. Удаляю старую версию..."
    rm -rf kontrast-shop
fi

git clone https://github.com/ponff/kontrast-shop.git
cd kontrast-shop
print_success "Проект склонирован в /srv/kontrast/kontrast-shop"
echo ""

# Шаг 8: Получение SSL сертификатов
print_info "Шаг 8/10: Получение SSL сертификатов..."

# Остановка всех Docker контейнеров, которые могут занимать порты
docker stop $(docker ps -q) 2>/dev/null || true

# Проверка DNS
print_info "Проверка DNS для kontrast-shop.ru..."
if ! nslookup kontrast-shop.ru | grep -q "186.246.30.115"; then
    print_warning "DNS может быть не настроен или еще не распространился"
    print_warning "Убедитесь, что kontrast-shop.ru указывает на 186.246.30.115"
    read -p "Продолжить? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Развертывание прервано. Настройте DNS и запустите скрипт снова."
        exit 1
    fi
fi

# Получение сертификатов
if [ -d "/etc/letsencrypt/live/kontrast-shop.ru" ]; then
    print_warning "Сертификаты уже существуют"
else
    certbot certonly --standalone --agree-tos --non-interactive \
        --email damirponff@gmail.com \
        -d kontrast-shop.ru \
        -d www.kontrast-shop.ru || {
            print_error "Не удалось получить SSL сертификаты"
            print_warning "Возможные причины:"
            print_warning "1. DNS еще не распространился (подождите 10-30 минут)"
            print_warning "2. Порты 80/443 заняты другим процессом"
            print_warning "3. Firewall блокирует входящие соединения"
            exit 1
        }
    print_success "SSL сертификаты получены"
fi

# Проверка сертификатов
ls -la /etc/letsencrypt/live/kontrast-shop.ru/
echo ""

# Шаг 9: Настройка переменных окружения
print_info "Шаг 9/10: Настройка переменных окружения..."

# Генерация SECRET_KEY
SECRET_KEY=$(python3 -c "import secrets; print(''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)') for i in range(50)))")

cat > .env.prod << EOF
DJANGO_SECRET_KEY=${SECRET_KEY}
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=kontrast-shop.ru,www.kontrast-shop.ru,186.246.30.115
EOF

print_success ".env.prod файл создан"
echo ""

# Шаг 10: Создание директорий для данных
print_info "Подготовка директорий для данных..."
mkdir -p back/media
touch back/db.sqlite3
chmod 666 back/db.sqlite3
chmod 777 back/media
print_success "Директории созданы"
echo ""

# Шаг 11: Запуск Docker Compose
print_info "Шаг 10/10: Сборка и запуск контейнеров..."
print_warning "Это может занять 5-10 минут..."
print_warning "Frontend будет собран внутри Docker (занимает больше времени при первом запуске)"
docker compose up -d --build

print_success "Контейнеры запущены!"
echo ""

# Ожидание запуска сервисов
print_info "Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Проверка статуса
print_info "Проверка статуса контейнеров..."
docker compose ps
echo ""

# Проверка логов
print_info "Последние логи backend:"
docker compose logs --tail=20 backend
echo ""

# Финальная информация
echo "========================================="
print_success "🎉 Развертывание завершено!"
echo "========================================="
echo ""
print_info "Ваш сайт доступен по адресу:"
echo "  🌐 https://kontrast-shop.ru"
echo "  🔧 https://kontrast-shop.ru/admin"
echo "  📡 https://kontrast-shop.ru/api/"
echo ""
print_info "Учетные данные администратора по умолчанию:"
echo "  Логин: admin"
echo "  Пароль: admin"
print_warning "ВАЖНО: Смените пароль администратора после первого входа!"
echo ""
print_info "Полезные команды:"
echo "  Просмотр логов:        docker compose logs -f"
echo "  Перезапуск:            docker compose restart"
echo "  Остановка:             docker compose down"
echo "  Статус контейнеров:    docker compose ps"
echo ""
print_info "Автоматическая перезагрузка SSL сертификатов:"
echo "  Проверка таймера:      systemctl status certbot.timer"
echo "  Ручное обновление:     certbot renew && docker compose restart nginx"
echo ""
print_success "Готово! Проверьте сайт в браузере."