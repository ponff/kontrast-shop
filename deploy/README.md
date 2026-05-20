Развёртывание проекта на сервере (прощай чеклист)

Коротко: скопируйте проект на сервер, настройте DNS, запустите скрипт deploy_prod.sh.

1) DNS
- В панели домена создайте A-запись:
  - `kontrast-shop.ru` → `186.246.30.115`
  - `www.kontrast-shop.ru` → `kontrast-shop.ru`

2) На сервере (Ubuntu/Debian) выполните:
```bash
# установите git, если нужно
sudo apt update
sudo apt install -y git
# клонируйте проект
sudo mkdir -p /srv
sudo chown $USER:$USER /srv
git clone <repo-url> /srv/kontrast
cd /srv/kontrast
```

3) Запустите автоматический скрипт (замените email на ваш):
```bash
sudo bash deploy/deploy_prod.sh kontrast-shop.ru damirponff@gmail.com /srv
```

Скрипт выполнит:
- установку Docker и certbot (если нужно),
- создание `.env.prod` из `.env.prod.example`,
- получение сертификата Let's Encrypt (standalone),
- запуск `docker compose up -d --build`,
- выполнение миграций и `collectstatic`,
- открытие портов 80/443 (ufw),
- включение автопродления сертификата через systemd timer.

Если у вас уже есть веб-сервер на портах 80/443 (nginx, apache), остановите его на время получения сертификата или используйте другой подход (certbot --nginx или получение сертификата вручную).

Если потребуется помощь по шагам или корректировки (Postgres, S3, CI/CD), напишите — помогу настроить.
