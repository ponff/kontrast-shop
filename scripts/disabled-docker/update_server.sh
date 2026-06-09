#!/bin/bash
set -e

echo "========================================="
echo "🔄 Обновление Kontrast Shop"
echo "========================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "ℹ️  $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Переход в директорию проекта
cd /srv/kontrast/kontrast-shop

# Получение обновлений из git
print_info "Получение обновлений из репозитория..."
git pull
print_success "Код обновлен"
echo ""

# Пересборка и перезапуск контейнеров
print_info "Пересборка и перезапуск контейнеров..."
print_warning "Frontend будет пересобран (это может занять несколько минут)..."
docker compose up -d --build

print_success "Контейнеры пересобраны и перезапущены"
echo ""

# Ожидание запуска
print_info "Ожидание запуска сервисов (30 секунд)..."
sleep 30

# Проверка статуса
print_info "Статус контейнеров:"
docker compose ps
echo ""

print_info "Последние логи backend:"
docker compose logs --tail=20 backend
echo ""

print_info "Последние логи frontend:"
docker compose logs --tail=20 frontend
echo ""

echo "========================================="
print_success "✅ Обновление завершено!"
echo "========================================="
echo ""
print_info "Проверьте сайт: https://kontrast-shop.ru"