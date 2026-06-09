# 🚀 Развертывание Kontrast Shop без Docker

Полное руководство по развертыванию интернет-магазина Kontrast Shop на Ubuntu/Debian сервере без использования Docker.

## 📋 Требования

### Минимальные требования сервера:
- **ОС**: Ubuntu 20.04+ или Debian 11+
- **RAM**: Минимум 2 GB (рекомендуется 4 GB)
- **Диск**: Минимум 20 GB свободного места
- **Процессор**: 2 CPU ядра
- **Доступ**: Root или sudo права

### Требования к сети:
- Домен, направленный на IP сервера (A-записи для домена и www)
- Открытые порты: 22 (SSH), 80 (HTTP), 443 (HTTPS)

### Что будет установлено:
- Python 3.10+ с виртуальным окружением
- Node.js 20.x
- Nginx (веб-сервер и reverse proxy)
- Certbot (для SSL сертификатов Let's Encrypt)
- Gunicorn (WSGI сервер для Django)

---

## 🎯 Быстрый старт (автоматическое развертывание)

Самый простой способ - использовать автоматический скрипт развертывания:

```bash
# 1. Клонировать репозиторий на сервер
git clone https://github.com/ponff/kontrast-shop /opt/kontrast-shop
cd /opt/kontrast-shop

# 2. Сделать скрипт исполняемым
chmod +x deploy_no_docker.sh

# 3. Запустить развертывание
sudo ./deploy_no_docker.sh
```

Или еще проще — копируйте и вставляйте эти 4 строки как есть.

Скрипт автоматически:
- ✅ Установит все зависимости
- ✅ Создаст системного пользователя
- ✅ Настроит Backend (Django) и Frontend (Next.js)
- ✅ Получит SSL сертификат Let's Encrypt
- ✅ Настроит Nginx и systemd сервисы
- ✅ Запустит все компоненты

## 🔧 Быстрая проверка после установки

Если окружение уже есть и вы хотите проверить backend вручную:

```bash
cd /opt/kontrast-shop/back
source .venv/bin/activate
python manage.py check
python manage.py test
```

Если `.venv` уже создано, то достаточно `source .venv/bin/activate` и `python manage.py test`.

**Время выполнения**: 10-15 минут (зависит от скорости интернета)

---

## 🛠️ Ручная установка (пошагово)

Если вы предпочитаете контроль над каждым шагом или хотите понять, что происходит под капотом.

### Шаг 1: Подготовка системы

```bash
# Обновить систему
sudo apt update
sudo apt upgrade -y

# Установить базовые утилиты
sudo apt install -y curl wget git build-essential software-properties-common
```

### Шаг 2: Установка Python 3.10+

```bash
# Установить Python и pip
sudo apt install -y python3 python3-pip python3-venv python3-dev

# Проверить версию
python3 --version  # Должно быть >= 3.10
```

### Шаг 3: Установка Node.js 20.x

```bash
# Добавить репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -

# Установить Node.js
sudo apt install -y nodejs

# Проверить версии
node --version  # Должно быть v20.x
npm --version
```

### Шаг 4: Установка Nginx

```bash
# Установить Nginx
sudo apt install -y nginx

# Включить автозапуск
sudo systemctl enable nginx
sudo systemctl start nginx

# Проверить статус
sudo systemctl status nginx
```

### Шаг 5: Установка Certbot

```bash
# Установить Certbot для Let's Encrypt
sudo apt install -y certbot

# Проверить версию
certbot --version
```

### Шаг 6: Создание пользователя и директорий

```bash
# Создать системного пользователя kontrast
sudo useradd -r -s /bin/bash -d /opt/kontrast-shop -m kontrast
sudo usermod -aG www-data kontrast

# Создать директорию для логов
sudo mkdir -p /var/log/kontrast-shop
sudo chown -R kontrast:www-data /var/log/kontrast-shop
sudo chmod 755 /var/log/kontrast-shop
```

### Шаг 7: Подготовка кода

```bash
# Клонировать или скопировать код в /opt/kontrast-shop
sudo git clone <your-repo-url> /opt/kontrast-shop

# Или скопировать из текущей директории
sudo cp -r . /opt/kontrast-shop/

# Установить права
sudo chown -R kontrast:www-data /opt/kontrast-shop

# Перейти в директорию
cd /opt/kontrast-shop
```

### Шаг 8: Настройка Backend (Django)

```bash
cd /opt/kontrast-shop/back

# Создать виртуальное окружение
sudo -u kontrast python3 -m venv .venv

# Активировать виртуальное окружение
sudo -u kontrast .venv/bin/pip install --upgrade pip

# Установить зависимости
sudo -u kontrast .venv/bin/pip install -r requirements.txt

# Создать .env.prod файл
sudo -u kontrast nano .env.prod
```

**Содержимое `.env.prod`** (используйте шаблон из `back/.env.prod.example`):

```bash
# Сгенерируйте секретный ключ:
# python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_SECRET_KEY=your-generated-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=kontrast-shop.ru,www.kontrast-shop.ru,ваш_server_ip

YOO_KASSA_SHOP_ID=ваш_shop_id
YOO_KASSA_SECRET_KEY=ваш_secret_key
YOO_KASSA_RETURN_URL=https://kontrast-shop.ru/

TELEGRAM_BOT_TOKEN=ваш_bot_token
TELEGRAM_SECRET_CODE=ваш_секретный_код
```

```bash
# Установить права на .env.prod
sudo chown kontrast:www-data .env.prod
sudo chmod 600 .env.prod

# Применить миграции
sudo -u kontrast .venv/bin/python manage.py migrate

# Собрать статику
sudo -u kontrast .venv/bin/python manage.py collectstatic --noinput

# Загрузить начальные данные (опционально)
sudo -u kontrast .venv/bin/python manage.py load_initial_data

# Создать суперпользователя
sudo -u kontrast .venv/bin/python manage.py createsuperuser
```

### Шаг 9: Настройка Frontend (Next.js)

```bash
cd /opt/kontrast-shop/front

# Создать .env.production
sudo -u kontrast nano .env.production
```

**Содержимое `.env.production`**:
```
NEXT_PUBLIC_API_URL=https://kontrast-shop.ru/api/
```

```bash
# Установить зависимости
sudo -u kontrast npm install --production

# Собрать production build
sudo -u kontrast npm run build
```

### Шаг 10: Создание systemd сервисов

**Backend сервис:**

```bash
sudo nano /etc/systemd/system/kontrast-backend.service
```

Вставьте содержимое из `deploy/systemd/kontrast-backend.service`

**Frontend сервис:**

```bash
sudo nano /etc/systemd/system/kontrast-frontend.service
```

Вставьте содержимое из `deploy/systemd/kontrast-frontend.service`

**Активация сервисов:**

```bash
# Перезагрузить systemd
sudo systemctl daemon-reload

# Включить автозапуск
sudo systemctl enable kontrast-backend
sudo systemctl enable kontrast-frontend

# Запустить сервисы
sudo systemctl start kontrast-backend
sudo systemctl start kontrast-frontend

# Проверить статус
sudo systemctl status kontrast-backend
sudo systemctl status kontrast-frontend
```

### Шаг 11: Получение SSL сертификата

```bash
# Остановить Nginx временно
sudo systemctl stop nginx

# Получить сертификат Let's Encrypt
sudo certbot certonly --standalone \
  -d kontrast-shop.ru \
  -d www.kontrast-shop.ru \
  --non-interactive \
  --agree-tos \
  --email your-email@example.com

# Настроить автообновление сертификата
(sudo crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet --post-hook 'systemctl reload nginx'") | sudo crontab -
```

### Шаг 12: Настройка Nginx

```bash
# Копировать конфигурацию
sudo cp /opt/kontrast-shop/nginx/nginx.conf.no-docker /etc/nginx/sites-available/kontrast-shop

# Создать симлинк
sudo ln -s /etc/nginx/sites-available/kontrast-shop /etc/nginx/sites-enabled/

# Удалить default конфигурацию
sudo rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
sudo nginx -t

# Запустить Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Шаг 13: Настройка файрвола

```bash
# Разрешить необходимые порты
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS

# Включить файрвол
sudo ufw enable
```

---

## ✅ Проверка работоспособности

### 1. Проверить сервисы

```bash
# Статус всех сервисов
sudo systemctl status kontrast-backend kontrast-frontend nginx

# Логи в реальном времени
sudo journalctl -u kontrast-backend -f
sudo journalctl -u kontrast-frontend -f
```

### 2. Проверить доступность

```bash
# Backend API
curl http://127.0.0.1:8000/api/products/
curl https://kontrast-shop.ru/api/products/

# Frontend
curl http://127.0.0.1:3000/
curl https://kontrast-shop.ru/
```

### 3. Проверить в браузере

- 🌐 **Главная страница**: https://kontrast-shop.ru
- 🔧 **Админ панель**: https://kontrast-shop.ru/admin
- 📚 **API документация**: https://kontrast-shop.ru/swagger

---

## 🔄 Обновление приложения

### Автоматическое обновление

```bash
cd /opt/kontrast-shop
sudo ./update_no_docker.sh
```

### Ручное обновление

```bash
cd /opt/kontrast-shop

# 1. Получить последний код
sudo -u kontrast git pull

# 2. Обновить Backend
cd back
sudo -u kontrast .venv/bin/pip install -r requirements.txt
sudo -u kontrast .venv/bin/python manage.py migrate
sudo -u kontrast .venv/bin/python manage.py collectstatic --noinput

# 3. Обновить Frontend
cd ../front
sudo -u kontrast npm install --production
sudo -u kontrast npm run build

# 4. Перезапустить сервисы
sudo systemctl restart kontrast-backend kontrast-frontend
sudo systemctl reload nginx
```

---

## 📊 Управление сервисами

### Просмотр статуса

```bash
# Все сервисы
sudo systemctl status kontrast-backend kontrast-frontend nginx

# Отдельный сервис
sudo systemctl status kontrast-backend
```

### Просмотр логов

```bash
# Логи через journalctl
sudo journalctl -u kontrast-backend -f
sudo journalctl -u kontrast-frontend -f
sudo journalctl -u kontrast-backend --since "1 hour ago"

# Файловые логи
sudo tail -f /var/log/kontrast-shop/backend-error.log
sudo tail -f /var/log/kontrast-shop/frontend-error.log
sudo tail -f /var/log/nginx/kontrast-shop-error.log
```

### Перезапуск сервисов

```bash
# Перезапустить backend
sudo systemctl restart kontrast-backend

# Перезапустить frontend
sudo systemctl restart kontrast-frontend

# Перезагрузить Nginx (без простоя)
sudo systemctl reload nginx

# Перезапустить все
sudo systemctl restart kontrast-backend kontrast-frontend nginx
```

### Остановка сервисов

```bash
sudo systemctl stop kontrast-backend
sudo systemctl stop kontrast-frontend
sudo systemctl stop nginx
```

---

## 🔧 Решение проблем (Troubleshooting)

### Backend не запускается

**Проблема**: `systemctl status kontrast-backend` показывает failed

**Решение**:

```bash
# 1. Проверить логи
sudo journalctl -u kontrast-backend -n 100

# 2. Проверить .env.prod
sudo cat /opt/kontrast-shop/back/.env.prod

# 3. Проверить права доступа
ls -la /opt/kontrast-shop/back/

# 4. Попробовать запустить вручную
cd /opt/kontrast-shop/back
sudo -u kontrast .venv/bin/gunicorn back.wsgi:application --bind 127.0.0.1:8000

# 5. Проверить виртуальное окружение
sudo -u kontrast .venv/bin/pip list
```

### Frontend не запускается

**Проблема**: Frontend сервис падает при запуске

**Решение**:

```bash
# 1. Проверить логи
sudo journalctl -u kontrast-frontend -n 100

# 2. Проверить что build выполнен
ls -la /opt/kontrast-shop/front/.next/

# 3. Пересобрать
cd /opt/kontrast-shop/front
sudo -u kontrast npm run build

# 4. Проверить зависимости
sudo -u kontrast npm list
```

### Nginx 502 Bad Gateway

**Проблема**: Nginx возвращает 502 ошибку

**Решение**:

```bash
# 1. Проверить что backend и frontend запущены
sudo systemctl status kontrast-backend kontrast-frontend

# 2. Проверить что они слушают порты
sudo netstat -tulpn | grep -E ':(8000|3000)'
# или
sudo ss -tulpn | grep -E ':(8000|3000)'

# 3. Проверить логи Nginx
sudo tail -100 /var/log/nginx/kontrast-shop-error.log

# 4. Проверить конфигурацию
sudo nginx -t
```

### SSL сертификат не работает

**Проблема**: Браузер показывает ошибку сертификата

**Решение**:

```bash
# 1. Проверить наличие сертификата
sudo ls -la /etc/letsencrypt/live/kontrast-shop.ru/

# 2. Проверить срок действия
sudo certbot certificates

# 3. Обновить сертификат вручную
sudo certbot renew

# 4. Проверить DNS
dig kontrast-shop.ru
dig www.kontrast-shop.ru

# 5. Проверить что домен указывает на правильный IP
curl -I https://kontrast-shop.ru
```

### Проблемы с правами доступа

**Проблема**: Permission denied ошибки

**Решение**:

```bash
# Исправить права на директорию приложения
sudo chown -R kontrast:www-data /opt/kontrast-shop
sudo chmod -R 755 /opt/kontrast-shop

# Исправить права на логи
sudo chown -R kontrast:www-data /var/log/kontrast-shop
sudo chmod -R 755 /var/log/kontrast-shop

# Исправить права на базу данных
sudo chown kontrast:www-data /opt/kontrast-shop/back/db.sqlite3
sudo chmod 664 /opt/kontrast-shop/back/db.sqlite3

# Исправить права на media
sudo chown -R kontrast:www-data /opt/kontrast-shop/back/media
sudo chmod -R 755 /opt/kontrast-shop/back/media
```

### Статические файлы не загружаются

**Проблема**: CSS/JS не работают на сайте

**Решение**:

```bash
# 1. Пересобрать статику
cd /opt/kontrast-shop/back
sudo -u kontrast .venv/bin/python manage.py collectstatic --noinput --clear

# 2. Проверить права
sudo ls -la /opt/kontrast-shop/back/staticfiles/

# 3. Проверить конфигурацию Nginx
sudo nginx -t
grep -A5 "location /staticfiles" /etc/nginx/sites-available/kontrast-shop

# 4. Перезагрузить Nginx
sudo systemctl reload nginx
```

---

## 🔒 Безопасность

### 1. Смена пароля администратора

```bash
cd /opt/kontrast-shop/back
sudo -u kontrast .venv/bin/python manage.py changepassword admin
```

### 2. Ограничение доступа к админке

Отредактируйте `/etc/nginx/sites-available/kontrast-shop`:

```nginx
location /admin {
    # Разрешить доступ только с определенных IP
    allow 123.123.123.123;  # Ваш IP
    deny all;
    
    proxy_pass http://backend_server;
    # ... остальные настройки
}
```

### 3. Настройка fail2ban (опционально)

```bash
# Установить fail2ban
sudo apt install -y fail2ban

# Создать jail для Django
sudo nano /etc/fail2ban/jail.local
```

```ini
[django-auth]
enabled = true
port = http,https
filter = django-auth
logpath = /var/log/kontrast-shop/backend-error.log
maxretry = 5
bantime = 3600
```

### 4. Регулярные обновления системы

```bash
# Настроить автоматические обновления безопасности
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## 💾 Backup и восстановление

### Создание backup

```bash
#!/bin/bash
# Скрипт backup

BACKUP_DIR="/backup/kontrast-shop"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup базы данных SQLite
cp /opt/kontrast-shop/back/db.sqlite3 $BACKUP_DIR/db_$DATE.sqlite3

# Backup media файлов
tar -czf $BACKUP_DIR/media_$DATE.tar.gz -C /opt/kontrast-shop/back media/

# Backup конфигурации
cp /opt/kontrast-shop/back/.env.prod $BACKUP_DIR/.env.prod_$DATE
cp /etc/nginx/sites-available/kontrast-shop $BACKUP_DIR/nginx_$DATE.conf

echo "Backup завершен: $BACKUP_DIR"
```

### Автоматический backup (cron)

```bash
# Добавить в crontab
sudo crontab -e

# Backup каждый день в 3:00
0 3 * * * /opt/kontrast-shop/backup.sh
```

### Восстановление из backup

```bash
# Остановить сервисы
sudo systemctl stop kontrast-backend kontrast-frontend

# Восстановить базу данных
sudo cp /backup/kontrast-shop/db_YYYYMMDD_HHMMSS.sqlite3 /opt/kontrast-shop/back/db.sqlite3
sudo chown kontrast:www-data /opt/kontrast-shop/back/db.sqlite3

# Восстановить media
sudo tar -xzf /backup/kontrast-shop/media_YYYYMMDD_HHMMSS.tar.gz -C /opt/kontrast-shop/back/
sudo chown -R kontrast:www-data /opt/kontrast-shop/back/media

# Запустить сервисы
sudo systemctl start kontrast-backend kontrast-frontend
```

---

## 📁 Структура директорий

```
/opt/kontrast-shop/
├── back/                          # Django Backend
│   ├── .venv/                     # Виртуальное окружение Python
│   ├── api/                       # Django приложение
│   ├── back/                      # Настройки Django
│   ├── db.sqlite3                 # База данных SQLite
│   ├── media/                     # Загруженные файлы
│   ├── staticfiles/               # Собранные статические файлы
│   ├── .env.prod                  # Переменные окружения
│   └── requirements.txt           # Python зависимости
├── front/                         # Next.js Frontend
│   ├── .next/                     # Собранное Next.js приложение
│   ├── node_modules/              # Node.js зависимости
│   ├── src/                       # Исходный код
│   ├── .env.production            # Переменные окружения
│   └── package.json               # Node.js зависимости
├── nginx/                         # Nginx конфигурации
│   └── nginx.conf.no-docker       # Конфигурация для развертывания
├── deploy/                        # Deployment файлы
│   └── systemd/                   # Systemd unit файлы
├── deploy_no_docker.sh            # Скрипт развертывания
└── update_no_docker.sh            # Скрипт обновления

/var/log/kontrast-shop/            # Логи приложений
├── backend-access.log
├── backend-error.log
├── frontend.log
└── frontend-error.log

/etc/nginx/sites-available/
└── kontrast-shop                  # Nginx конфигурация

/etc/systemd/system/
├── kontrast-backend.service       # Systemd unit для backend
└── kontrast-frontend.service      # Systemd unit для frontend
```

---

## 🆘 Получение помощи

- **Логи Backend**: `sudo journalctl -u kontrast-backend -f`
- **Логи Frontend**: `sudo journalctl -u kontrast-frontend -f`
- **Логи Nginx**: `sudo tail -f /var/log/nginx/kontrast-shop-error.log`
- **Проверка портов**: `sudo netstat -tulpn | grep -E ':(80|443|3000|8000)'`
- **Проверка процессов**: `ps aux | grep -E '(gunicorn|node|nginx)'`

---

## 📝 Лицензия

© 2026 Kontrast Shop. Все права защищены.
