# Инструкция по развертыванию проекта на сервере

## Что было исправлено

### 1. ✅ Исправлена кодировка requirements.txt
- Файл был в UTF-16, теперь в UTF-8
- Добавлен gunicorn для продакшн-сервера

### 2. ✅ Добавлена загрузка переменных окружения
- docker-compose.yml теперь загружает `.env.prod` для backend
- Переменные DJANGO_SECRET_KEY, DJANGO_DEBUG, DJANGO_ALLOWED_HOSTS будут применяться

### 3. ✅ Заменен runserver на gunicorn
- Django runserver не подходит для продакшена
- Используется gunicorn с 4 воркерами

### 4. ✅ Настроен nginx для продакшена
- Добавлены публичные порты 80 и 443
- Настроено перенаправление HTTP → HTTPS
- Настроено перенаправление www → без www
- Добавлены правильные proxy headers
- Добавлено кэширование статики и медиа

### 5. ✅ Исправлены volumes для базы данных
- База данных и медиафайлы теперь монтируются как volumes
- Данные не будут потеряны при пересборке контейнеров

## Пошаговая инструкция развертывания

### Шаг 1: Подготовка сервера

На сервере должны быть установлены:
```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установка Docker Compose
sudo apt install -y docker-compose-plugin

# Установка Git
sudo apt install -y git

# Установка certbot
sudo apt install -y certbot
```

### Шаг 2: Клонирование проекта

```bash
# Создание директории для проекта
sudo mkdir -p /srv/kontrast
sudo chown $USER:$USER /srv/kontrast
cd /srv/kontrast

# Клонирование репозитория
git clone https://github.com/ponff/kontrast-shop.git
cd kontrast-shop
```

### Шаг 3: Настройка DNS

В панели управления доменом добавьте A-запись:
- `kontrast-shop.ru` → `186.246.30.115`
- `www.kontrast-shop.ru` → `186.246.30.115`

Проверьте, что DNS резолвится:
```bash
nslookup kontrast-shop.ru
```

### Шаг 4: Получение SSL сертификата

**ВАЖНО:** Это нужно сделать ДО запуска docker-compose, так как nginx не запустится без сертификатов.

```bash
# Остановите все, что занимает порты 80/443
sudo systemctl stop nginx 2>/dev/null || true
sudo docker stop $(sudo docker ps -q) 2>/dev/null || true

# Получение сертификата
sudo certbot certonly --standalone --agree-tos \
  --email damirponff@gmail.com \
  -d kontrast-shop.ru \
  -d www.kontrast-shop.ru

# Проверка что сертификаты созданы
sudo ls -la /etc/letsencrypt/live/kontrast-shop.ru/
```

### Шаг 5: Настройка переменных окружения

Создайте файл `.env.prod` в корне проекта:

```bash
cat > .env.prod << 'EOF'
DJANGO_SECRET_KEY=замените-на-сложный-случайный-ключ-минимум-50-символов
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=kontrast-shop.ru,www.kontrast-shop.ru,186.246.30.115
EOF
```

Для генерации безопасного SECRET_KEY можете использовать:
```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### Шаг 6: Создание директорий для данных

```bash
# Создание директории для базы данных и медиа
mkdir -p back/media
touch back/db.sqlite3
chmod 666 back/db.sqlite3
chmod 777 back/media
```

### Шаг 7: Запуск проекта

```bash
# Сборка и запуск всех контейнеров
sudo docker compose up -d --build
```

Сборка может занять 5-10 минут.

### Шаг 8: Применение миграций и создание суперпользователя

```bash
# Проверка что контейнеры запущены
sudo docker compose ps

# Миграции и статика уже применяются автоматически в start.sh
# Но можно проверить логи
sudo docker compose logs backend

# Если нужно создать дополнительного админа
sudo docker compose exec backend python manage.py createsuperuser
```

### Шаг 9: Открытие портов в firewall

```bash
# Если используется ufw
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Проверка статуса
sudo ufw status
```

### Шаг 10: Проверка работы

Откройте в браузере:
- https://kontrast-shop.ru - главная страница
- https://kontrast-shop.ru/admin - админка Django
- https://kontrast-shop.ru/api/ - API эндпоинты

Проверьте логи:
```bash
# Все логи
sudo docker compose logs -f

# Только backend
sudo docker compose logs -f backend

# Только nginx
sudo docker compose logs -f nginx

# Только frontend
sudo docker compose logs -f frontend
```

## Автоматическое обновление SSL сертификатов

Certbot автоматически создаст cron задачу для обновления сертификатов. Проверьте:
```bash
sudo systemctl status certbot.timer
```

Для ручного обновления:
```bash
sudo certbot renew
sudo docker compose restart nginx
```

## Полезные команды

```bash
# Перезапуск всех сервисов
sudo docker compose restart

# Перезапуск только backend
sudo docker compose restart backend

# Остановка проекта
sudo docker compose down

# Остановка с удалением volumes (осторожно!)
sudo docker compose down -v

# Просмотр логов
sudo docker compose logs -f

# Пересборка после изменений в коде
git pull
sudo docker compose up -d --build

# Вход в контейнер backend
sudo docker compose exec backend bash

# Выполнение команд Django
sudo docker compose exec backend python manage.py shell
sudo docker compose exec backend python manage.py migrate
sudo docker compose exec backend python manage.py collectstatic --noinput
```

## Устранение проблем

### Nginx не запускается

Проверьте, что сертификаты существуют:
```bash
sudo ls -la /etc/letsencrypt/live/kontrast-shop.ru/
```

Проверьте логи nginx:
```bash
sudo docker compose logs nginx
```

### Backend не запускается

Проверьте логи:
```bash
sudo docker compose logs backend
```

Проверьте переменные окружения:
```bash
sudo docker compose exec backend env | grep DJANGO
```

### Ошибка "No space left on device"

Очистите старые Docker образы:
```bash
sudo docker system prune -a --volumes
sudo docker builder prune -a
```

### База данных не сохраняется

Проверьте права на файл:
```bash
ls -la back/db.sqlite3
```

Должно быть `-rw-rw-rw-` или похожее.

### Статика не отдается

Проверьте, что статика собрана:
```bash
sudo docker compose exec backend python manage.py collectstatic --noinput
ls -la back/staticfiles/
```

## Мониторинг

Проверка использования ресурсов:
```bash
# Использование CPU/RAM контейнерами
sudo docker stats

# Использование диска
df -h
sudo docker system df
```

## Бэкапы

Рекомендуется делать регулярные бэкапы базы данных и медиафайлов:

```bash
# Бэкап базы данных
sudo cp back/db.sqlite3 back/db.sqlite3.backup.$(date +%Y%m%d_%H%M%S)

# Бэкап медиафайлов
sudo tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz back/media/

# Автоматический бэкап можно добавить в cron
sudo crontab -e
# Добавить строку (каждый день в 3 ночи):
# 0 3 * * * cd /srv/kontrast/kontrast-shop && cp back/db.sqlite3 back/db.sqlite3.backup.$(date +\%Y\%m\%d)
```

## Миграция на PostgreSQL (рекомендуется для продакшена)

Для продакшена лучше использовать PostgreSQL вместо SQLite. Если захотите мигрировать позже - напишите, помогу настроить.
