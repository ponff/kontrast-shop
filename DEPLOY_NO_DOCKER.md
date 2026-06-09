
# Быстрая установка и запуск Kontrast Shop (без Docker)

Ниже — обновлённый короткий набор команд, адаптированный под текущую структуру репозитория.

1) Клонируем репозиторий и переходим в папку:

```bash
sudo mkdir -p /opt/kontrast-shop
sudo chown $USER:$USER /opt/kontrast-shop
git clone https://github.com/ponff/kontrast-shop /opt/kontrast-shop
cd /opt/kontrast-shop
```

2) Сгенерировать/настроить переменные окружения (обязательно перед деплоем)

Удобный способ — запустить интерактивный helper, который создаст `back/.env.prod` и `front/.env.production`:

```bash
chmod +x scripts/setup_env.sh
./scripts/setup_env.sh
```

Этот скрипт создаст файлы с безопасными правами (`600`) и подскажет, какие значения заполнить. Файлы не должны попадать в git (в проекте добавлено правило в `.gitignore`).

3) Запустить автоматический деплой (скрипт установит зависимости, systemd и Nginx):

```bash
chmod +x deploy_no_docker.sh
sudo ./deploy_no_docker.sh
```

4) Проверить статус сервисов и логи:

```bash
sudo systemctl status kontrast-backend kontrast-frontend nginx
sudo journalctl -u kontrast-backend -n 200
```

Примечания и изменения относительно старой инструкции:
- Сценарии, ориентированные на Docker, перемещены в `scripts/disabled-docker/`.
- `deploy_no_docker.sh` больше не хардкодит токены — используйте `scripts/setup_env.sh` или заполните `back/.env.prod` вручную.
- Файл `back/.env.prod` добавлен в `.gitignore` чтобы предотвратить случайный коммит секретов.

Если нужно, могу автоматически вставить вызов `./scripts/setup_env.sh` в начало `deploy_no_docker.sh` (требуется ваше подтверждение).

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
