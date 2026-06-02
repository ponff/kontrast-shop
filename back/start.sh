#!/bin/bash
set -e

echo "🔄 Применяем миграции..."
python manage.py migrate --noinput

echo "📦 Собираем статику..."
python manage.py collectstatic --noinput

echo "👤 Проверяем суперпользователя..."
python manage.py shell << END
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mail.com', 'admin')
    print("✅ Суперпользователь 'admin' создан")
else:
    print("ℹ️  Суперпользователь 'admin' уже существует")
END

echo "🚀 Запускаем Django через Gunicorn на 0.0.0.0:8000..."
gunicorn back.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 60