# Kontrast Shop

Интернет-магазин кожаных изделий и аксессуаров с современным стеком технологий.

## 🏗️ Архитектура

Проект состоит из трех основных компонентов:

- **Backend** — Django REST Framework API на порту 8000
- **Frontend** — Next.js приложение на порту 3000
- **Nginx** — реверс-прокси для маршрутизации и SSL

Все компоненты запускаются через Docker Compose.

## 🚀 Быстрый старт

### Автоматическое развертывание на сервере

Для развертывания на чистом Ubuntu сервере используйте автоматический скрипт:

```bash
# Подключитесь к серверу
ssh root@your-server-ip

# Скачайте и запустите скрипт
wget https://raw.githubusercontent.com/ponff/kontrast-shop/main/deploy_server.sh
chmod +x deploy_server.sh
./deploy_server.sh
```

Скрипт автоматически:
- Установит Docker, Docker Compose, Git, Certbot
- Настроит firewall
- Склонирует проект
- Получит SSL сертификаты
- Создаст безопасные переменные окружения
- Соберет и запустит все контейнеры

**Важно:** Перед запуском убедитесь, что DNS записи для вашего домена указывают на IP сервера.

Подробная инструкция: [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)

### Локальная разработка

```bash
# Клонировать репозиторий
git clone https://github.com/ponff/kontrast-shop.git
cd kontrast-shop

# Создать файл .env.prod (для локальной разработки можно использовать тестовые значения)
cat > .env.prod << EOF
DJANGO_SECRET_KEY=local-dev-secret-key-change-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
EOF

# Запустить все сервисы
docker compose up -d --build

# Проверить статус
docker compose ps
```

Сайт будет доступен на:
- Frontend: http://localhost
- API: http://localhost/api/
- Django Admin: http://localhost/admin
- API Docs: http://localhost/swagger

**Учетные данные по умолчанию:**
- Логин: `admin`
- Пароль: `admin`

## 📦 Структура проекта

```
kontrast-shop/
├── back/                    # Django backend
│   ├── api/                 # Django app с моделями и API
│   ├── back/                # Настройки Django проекта
│   ├── media/               # Загруженные медиафайлы
│   ├── staticfiles/         # Собранная статика
│   ├── Dockerfile           # Docker образ для backend
│   ├── requirements.txt     # Python зависимости
│   └── start.sh             # Скрипт запуска с миграциями
├── front/                   # Next.js frontend
│   ├── src/                 # Исходный код приложения
│   ├── public/              # Статические файлы
│   ├── Dockerfile           # Docker образ для frontend
│   └── package.json         # Node.js зависимости
├── nginx/                   # Nginx конфигурация
│   ├── nginx.conf           # Основной конфиг с SSL
│   └── Dockerfile           # Docker образ для nginx
├── docker-compose.yml       # Оркестрация всех сервисов
├── deploy_server.sh         # Скрипт автоматического развертывания
└── README.md                # Этот файл
```

## 🛠️ Технологии

### Backend
- Python 3.10
- Django 5.2.3
- Django REST Framework 3.16.0
- SQLite (можно заменить на PostgreSQL)
- Gunicorn
- YooKassa для оплаты
- Telegram Bot для уведомлений

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Zustand (управление состоянием корзины)

### DevOps
- Docker & Docker Compose
- Nginx
- Let's Encrypt SSL
- Автоматический перезапуск контейнеров

## 📖 Полезные команды

### Docker Compose

```bash
# Запустить все сервисы
docker compose up -d

# Пересобрать и запустить после изменений
docker compose up -d --build

# Остановить все сервисы
docker compose down

# Просмотр логов
docker compose logs -f

# Логи отдельного сервиса
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Статус контейнеров
docker compose ps

# Перезапустить сервис
docker compose restart backend
```

### Django команды

```bash
# Выполнить миграции
docker compose exec backend python manage.py migrate

# Собрать статику
docker compose exec backend python manage.py collectstatic --noinput

# Создать суперпользователя
docker compose exec backend python manage.py createsuperuser

# Войти в Django shell
docker compose exec backend python manage.py shell

# Войти в контейнер
docker compose exec backend bash
```

### Управление данными

Для работы с данными смотрите документацию в папке `back/`:
- [LOAD_DATA_README.md](back/LOAD_DATA_README.md) - загрузка тестовых данных
- [IMPORT_EXPORT_GUIDE.md](back/IMPORT_EXPORT_GUIDE.md) - импорт/экспорт товаров
- [UPLOAD_IMAGES_GUIDE.md](back/UPLOAD_IMAGES_GUIDE.md) - структура папок для изображений

## 🔒 Безопасность

В продакшене обязательно:

1. Измените `DJANGO_SECRET_KEY` на случайную строку (50+ символов)
2. Установите `DJANGO_DEBUG=False`
3. Укажите правильные домены в `DJANGO_ALLOWED_HOSTS`
4. Смените пароль администратора после первого входа
5. Настройте регулярные бэкапы базы данных

## 🔄 Автоматический перезапуск

Все контейнеры настроены с `restart: unless-stopped`, что означает:
- Автоматический перезапуск при падении
- Автоматический запуск при перезагрузке сервера
- Не перезапускаются только если вы их вручную остановите

## 📝 Переменные окружения

Создайте файл `.env.prod` в корне проекта:

```env
DJANGO_SECRET_KEY=ваш-длинный-случайный-секретный-ключ
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=your-domain.com,www.your-domain.com,your-server-ip
```

Для генерации безопасного SECRET_KEY:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

## 🐛 Отладка проблем

### Nginx не запускается
```bash
# Проверить наличие сертификатов
sudo ls -la /etc/letsencrypt/live/your-domain.com/

# Проверить логи
docker compose logs nginx
```

### Backend не запускается
```bash
# Проверить логи
docker compose logs backend

# Проверить переменные окружения
docker compose exec backend env | grep DJANGO
```

### База данных не сохраняется
```bash
# Проверить права на файл
ls -la back/db.sqlite3

# Должно быть -rw-rw-rw- или похожее
chmod 666 back/db.sqlite3
```

### Очистка Docker при нехватке места
```bash
# Очистить все неиспользуемые образы и контейнеры
docker system prune -a --volumes

# Очистить кэш builder
docker builder prune -a
```

## 📊 Мониторинг

```bash
# Использование ресурсов контейнерами
docker stats

# Использование диска
df -h
docker system df
```

## 💾 Бэкапы

Рекомендуется делать регулярные бэкапы:

```bash
# Бэкап базы данных
cp back/db.sqlite3 back/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)

# Бэкап медиафайлов
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz back/media/
```

## 📞 Поддержка

Для вопросов и предложений создавайте issue в репозитории.

## 📄 Лицензия

Проект создан для коммерческого использования.
