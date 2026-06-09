#!/bin/bash
# Скрипт для распаковки и запуска на сервере

cd /srv/kontrast/kontrast-shop/front
echo "📦 Распаковка frontend..."
tar -xzf frontend-build.tar.gz
rm frontend-build.tar.gz

cd /srv/kontrast/kontrast-shop
echo "🐳 Копирование конфигурации..."
cp docker-compose.prebuilt.yml docker-compose.yml

echo "🚀 Запуск контейнеров..."
docker compose up -d --build

echo "⏳ Ожидание запуска сервисов..."
sleep 30

echo "📊 Статус контейнеров:"
docker compose ps

echo "📝 Логи backend:"
docker compose logs --tail=20 backend

echo "✅ Готово!"
echo "🌐 Проверьте сайт: https://kontrast-shop.ru"