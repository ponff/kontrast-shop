#!/bin/bash

###############################################################################
# Скрипт обновления Kontrast Shop (без Docker)
# Обновляет код, зависимости и перезапускает сервисы
###############################################################################

set -e  # Остановить при ошибке

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Путь к приложению
APP_DIR="/opt/kontrast-shop"
BACKEND_DIR="$APP_DIR/back"
FRONTEND_DIR="$APP_DIR/front"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Обновление Kontrast Shop${NC}"
echo -e "${BLUE}========================================${NC}"

# Проверка прав root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Запустите скрипт с правами root (sudo)${NC}"
    exit 1
fi

# Проверка существования директории
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Директория $APP_DIR не найдена${NC}"
    echo -e "${YELLOW}💡 Сначала выполните deploy_no_docker.sh для начального развертывания${NC}"
    exit 1
fi

cd "$APP_DIR"

# 1. Получить последний код из Git
echo -e "\n${BLUE}📥 Получение последнего кода из Git...${NC}"
if [ -d ".git" ]; then
    sudo -u kontrast git fetch origin
    sudo -u kontrast git pull origin main || sudo -u kontrast git pull origin master
    echo -e "${GREEN}✅ Код обновлен${NC}"
else
    echo -e "${YELLOW}⚠️  Не Git репозиторий, пропускаем обновление кода${NC}"
fi

# 2. Обновить зависимости Backend
echo -e "\n${BLUE}📦 Обновление зависимостей Backend (Python)...${NC}"
cd "$BACKEND_DIR"
if [ -f "requirements.txt" ]; then
    sudo -u kontrast .venv/bin/pip install --upgrade pip
    sudo -u kontrast .venv/bin/pip install -r requirements.txt
    echo -e "${GREEN}✅ Python зависимости обновлены${NC}"
else
    echo -e "${RED}❌ requirements.txt не найден${NC}"
    exit 1
fi

# 3. Применить миграции Django
echo -e "\n${BLUE}🔄 Применение миграций базы данных...${NC}"
sudo -u kontrast .venv/bin/python manage.py migrate --noinput
echo -e "${GREEN}✅ Миграции применены${NC}"

# 4. Собрать статические файлы
echo -e "\n${BLUE}📦 Сборка статических файлов Django...${NC}"
sudo -u kontrast .venv/bin/python manage.py collectstatic --noinput --clear
echo -e "${GREEN}✅ Статика собрана${NC}"

# 5. Обновить зависимости Frontend
echo -e "\n${BLUE}📦 Обновление зависимостей Frontend (Node.js)...${NC}"
cd "$FRONTEND_DIR"
if [ -f "package.json" ]; then
    sudo -u kontrast npm install --production
    echo -e "${GREEN}✅ Node.js зависимости обновлены${NC}"
else
    echo -e "${RED}❌ package.json не найден${NC}"
    exit 1
fi

# 6. Пересобрать Frontend
echo -e "\n${BLUE}🔨 Пересборка Next.js приложения...${NC}"
sudo -u kontrast npm run build
echo -e "${GREEN}✅ Frontend пересобран${NC}"

# 7. Перезапустить сервисы
echo -e "\n${BLUE}🔄 Перезапуск сервисов...${NC}"

echo -e "${YELLOW}   Остановка сервисов...${NC}"
systemctl stop kontrast-backend kontrast-frontend

echo -e "${YELLOW}   Запуск backend...${NC}"
systemctl start kontrast-backend
sleep 3

echo -e "${YELLOW}   Запуск frontend...${NC}"
systemctl start kontrast-frontend
sleep 3

echo -e "${YELLOW}   Перезагрузка Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}✅ Сервисы перезапущены${NC}"

# 8. Проверить статус сервисов
echo -e "\n${BLUE}🔍 Проверка статуса сервисов...${NC}"
sleep 2

BACKEND_STATUS=$(systemctl is-active kontrast-backend)
FRONTEND_STATUS=$(systemctl is-active kontrast-frontend)
NGINX_STATUS=$(systemctl is-active nginx)

echo -e "Backend:  ${BACKEND_STATUS}"
echo -e "Frontend: ${FRONTEND_STATUS}"
echo -e "Nginx:    ${NGINX_STATUS}"

if [ "$BACKEND_STATUS" = "active" ] && [ "$FRONTEND_STATUS" = "active" ] && [ "$NGINX_STATUS" = "active" ]; then
    echo -e "\n${GREEN}✅ Обновление завершено успешно!${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}🎉 Сайт обновлен и работает${NC}"
    echo -e "${BLUE}========================================${NC}"
else
    echo -e "\n${RED}❌ Некоторые сервисы не запущены${NC}"
    echo -e "${YELLOW}Проверьте логи:${NC}"
    echo -e "  journalctl -u kontrast-backend -n 50"
    echo -e "  journalctl -u kontrast-frontend -n 50"
    exit 1
fi

# 9. Показать информацию о версии
echo -e "\n${BLUE}📋 Информация о версии:${NC}"
cd "$APP_DIR"
if [ -d ".git" ]; then
    echo -e "Git commit: $(git rev-parse --short HEAD)"
    echo -e "Git branch: $(git branch --show-current)"
fi

echo -e "\n${YELLOW}💡 Полезные команды:${NC}"
echo -e "  Просмотр логов backend:  journalctl -u kontrast-backend -f"
echo -e "  Просмотр логов frontend: journalctl -u kontrast-frontend -f"
echo -e "  Перезапуск сервисов:     systemctl restart kontrast-backend kontrast-frontend"
