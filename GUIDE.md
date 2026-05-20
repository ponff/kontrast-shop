# 📚 Руководство по проекту Kontrast Shop

## 🏗️ Архитектура проекта

Проект состоит из 3 основных компонентов:

```
┌─────────────────────────────────────┐
│   Frontend (Next.js + React)        │ :3000
│   - React 19, TailwindCSS           │
│   - Zustand (управление корзиной)   │
│   - React Query, React Hook Form    │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Nginx (Reverse Proxy)             │ :80, :443
│   - Маршрутизирует запросы          │
│   - Раздает статику                 │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Backend (Django REST Framework)   │ :8000
│   - DRF, drf-spectacular            │
│   - Telegram Bot уведомления        │
│   - SQLite база данных              │
└─────────────────────────────────────┘
```

---

## 📦 Бэк-end (Django)

### Главные компоненты:

#### **1. Модели данных** (`back/api/models.py`)
- **Product** - Товары в каталоге
  - Название, описание, цена
  - Автоматически рассчитывает цену с наценкой (+10%)
  - Связь с изображениями через `image_directory`
  
- **Order** - Обычный заказ
  - ФИО, телефон, email, адрес
  - JSON список товаров
  - Статусы: проверен, оплачен
  
- **CustomOrder** - Заявка на пользовательский заказ
  - ФИО, телефон, email
  - Комментарий с пожеланиями
  - Статусы: проверен, оплачен

#### **2. Система корзины** (`back/api/cart.py`)
- Хранится в сессии Django
- Методы: `add()`, `remove()`, `update()`, `clear()`
- Возвращает общую стоимость

#### **3. API endpoints** (`back/api/urls.py`)
```
GET    /api/products/              - Список товаров
GET    /api/products/<id>/         - Данные товара
POST   /api/orders/create/         - Создать заказ
POST   /api/castom-order/          - Создать заявку
POST   /api/cart/add/<id>/         - Добавить в корзину
POST   /api/cart/remove/<id>/      - Удалить из корзины
PUT    /api/cart/update/<id>/      - Обновить количество
POST   /api/cart/clear/            - Очистить корзину
GET    /api/cart/detail/           - Получить корзину
GET    /api/csrf/                  - Получить CSRF токен
```

#### **4. Telegram уведомления** (`back/api/telegram_bot.py`)
- Бот отправляет уведомления при новых заказах
- Команды: `/start`, `/auth`, `/orders`, `/custom`, `/notifications`
- Требует `TELEGRAM_BOT_TOKEN` в настройках

### Настройки Django (`back/back/settings.py`)

**Ключевые переменные окружения:**
```python
SECRET_KEY = "django-insecure-..."  # ⚠️ Меняйте в продакшене!
DEBUG = True                        # ⚠️ False в продакшене
TELEGRAM_BOT_TOKEN = "xxx:xxx"      # Токен бота из @BotFather
TELEGRAM_SECRET_CODE = "xxx"        # Код для аутентификации в боте
```

**CORS и CSRF настройки:**
- Разрешены localhost, docker сервисы
- CSRF cookie включен для POST запросов

---

## 🎨 Фронт-end (Next.js)

### Архитектура:

#### **Структура `/src`:**
```
src/
├── app/              - Next.js App Router
│   ├── layout.js     - Главный layout
│   ├── page.js       - Главная страница
│   ├── cart/         - Страница корзины
│   └── pd_policy/    - Политика приватности
├── components/       - React компоненты
│   ├── ProductCard.jsx      - Карточка товара
│   ├── ProductCatalog.jsx   - Каталог товаров
│   ├── Header.jsx           - Шапка сайта
│   ├── Footer.jsx           - Подвал
│   └── forms/               - Формы заказов
├── hooks/            - Custom React hooks
│   ├── useProducts.js       - Загрузка товаров
│   ├── useOrderForm.js      - Форма заказа
│   └── useCustomForm.js     - Форма заявки
├── store/            - Zustand стор
│   └── cartStore.js         - Управление корзиной
├── lib/
│   ├── api.js               - Axios конфиг + endpoints
│   └── utils.js             - Утилиты
└── utils/
    └── formatPrice.js       - Форматирование цены
```

#### **Zustand Store (Корзина)** `src/store/cartStore.js`
```javascript
// Методы:
useCartStore.fetchCart()        // Загрузить корзину с сервера
useCartStore.addItem()          // Добавить товар
useCartStore.removeItem()       // Удалить товар
useCartStore.updateQuantity()   // Изменить количество
useCartStore.clear()            // Очистить корзину
useCartStore.items              // Массив товаров в корзине
useCartStore.totalPrice         // Общая стоимость
```

#### **API клиент** `src/lib/api.js`
- Axios с baseURL на `/api/`
- Автоматически добавляет CSRF токен в заголовки
- `withCredentials: true` для отправки cookies

#### **Стили**
- TailwindCSS 4.x для стилизации
- PostCSS для обработки
- ESLint + Prettier для кода

---

## 🐳 Docker & Инфраструктура

### `docker-compose.yml`

**Сервисы:**

1. **backend** (Django)
   - Порт: 8000
   - Volume: `./back:/usr/src/app` (горячая перезагрузка)
   - БД: SQLite (db.sqlite3)

2. **frontend** (Next.js)
   - Порт: 3000
   - Зависит от: backend

3. **nginx** (Reverse Proxy)
   - Порт: 80 (HTTP), 443 (HTTPS)
   - Маршруты:
     - `/api/*` → backend:8000
     - `/admin/*` → backend:8000
     - `/swagger/*` → backend:8000
     - `/staticfiles/*` → /staticfiles
     - `/media/*` → /media
     - `/*` → frontend:3000
   - Зависит от: backend, frontend

### Запуск локально:
```bash
docker compose up -d --build
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Admin: http://localhost/admin
# API Swagger: http://localhost/swagger
```

---

## 🔧 Что нужно настроить ДО запуска

### 1. Переменные окружения (`back/back/settings.py`)
```python
TELEGRAM_BOT_TOKEN = "ваш_токен"      # Получить от @BotFather
TELEGRAM_SECRET_CODE = "ваш_код"      # Любой код для аутентификации
SECRET_KEY = "новый_секретный_ключ"   # Для безопасности
```

### 2. Миграции БД
```bash
docker compose exec backend python manage.py migrate
docker compose exec backend python manage.py createsuperuser
```

### 3. Загрузить статику
```bash
docker compose exec backend python manage.py collectstatic --noinput
```

### 4. Media файлы
- Разместить изображения товаров в `/back/media/`
- Структура: `media/товар-1/image1.jpg`, `media/товар-1/image2.jpg` и т.д.
- В админ-панели указать `image_directory` для каждого товара

### 5. Telegram бот (опционально)
- Создать бота через @BotFather
- Получить токен
- Добавить `TELEGRAM_BOT_TOKEN` в settings
- Запустить бота: `python manage.py run_bot`

---

## 📱 Основной флоу заказа

```
1. Пользователь выбирает товары
   ↓
2. Товары добавляются в корзину (Zustand store + сессия)
   ↓
3. Заполняет форму и отправляет заказ (POST /api/orders/create/)
   ↓
4. Backend создает Order в БД
   ↓
5. Telegram бот отправляет уведомление админу
   ↓
6. Админ проверяет заказ в админ-панели (/admin)
```

---

## 🛠️ Полезные команды

### Backend
```bash
# Миграции
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate

# Суперпользователь
docker compose exec backend python manage.py createsuperuser

# Запустить Telegram бота
docker compose exec backend python manage.py run_bot

# Shell Django
docker compose exec backend python manage.py shell

# Сборка статики
docker compose exec backend python manage.py collectstatic --noinput

# Форматирование кода
docker compose exec backend black .
docker compose exec backend pylint --load-plugins=pylint_django .
```

### Frontend
```bash
# Установка зависимостей
docker compose exec frontend npm install

# Линтинг
docker compose exec frontend npm run lint
docker compose exec frontend npm run lint:fix

# Форматирование
docker compose exec frontend npm run format

# Генерация sitemap
docker compose exec frontend npm run generate-sitemap
```

### Docker
```bash
# Посмотреть логи
docker compose logs -f backend    # Backend логи
docker compose logs -f frontend   # Frontend логи
docker compose logs -f nginx      # Nginx логи

# Перестроить контейнеры
docker compose down
docker compose up -d --build

# Очистить всё
docker compose down -v  # Удалит volumes!
```

---

## 📊 Админ-панель

**URL:** `http://localhost/admin`

### Установленные пакеты:

#### **django-grappelli** 🎨
Красивый и мощный интерфейс для админ-панели Django

**Возможности:**
- Улучшенный дизайн админ-панели
- Встроенный поиск по моделям
- Автодополнение в FK полях
- Лучшая навигация и фильтры
- Темная/светлая тема

#### **django-import-export** 📊
Импорт и экспорт данных (CSV, Excel)

**Возможности товаров:**
- **Экспорт товаров** → CSV, Excel
- **Импорт товаров** → из CSV, Excel
- Импорт заказов и заявок
- Преобразование данных перед сохранением

### Как использовать:

**Экспортировать товары:**
1. Перейти: `http://localhost/admin/api/product/`
2. Выбрать товары (или все через чекбокс)
3. Нажать кнопку **"Export"** (вверху справа)
4. Выбрать формат (CSV, Excel)
5. Скачать файл

**Импортировать товары:**
1. Перейти: `http://localhost/admin/api/product/`
2. Нажать кнопку **"Import"** (вверху справа)
3. Загрузить файл CSV/Excel
4. Выбрать конфликт действия (skip, update, create)
5. Нажать **"Confirm Import"**

**Экспортировать заказы:**
1. Перейти: `http://localhost/admin/api/order/`
2. Нажать **"Export"**
3. Выбрать формат
4. Скачать

### Пример CSV структуры товаров:

```csv
id,name,description,self_price,price,image_directory
1,Кожа черная,"Качественная кожа",1000,1100,photos/black
2,Кожа коричневая,"Премиум кожа",1500,1650,photos/brown
```

**Дополнительные возможности админа:**
- Добавлять/редактировать товары
- Просматривать заказы и статусы
- Быстрое редактирование через list_editable
- Управлять пользователями
- API Swagger документация: `http://localhost/swagger`

---

## ⚠️ Важные замечания ПЕРЕД ПРОДАКШЕНОМ

1. **Смените SECRET_KEY** в settings.py
2. **Установите DEBUG = False**
3. **Добавьте свой домен** в ALLOWED_HOSTS и CORS_ALLOWED_ORIGINS
4. **Используйте PostgreSQL** вместо SQLite
5. **Сконфигурируйте HTTPS** в nginx.conf
6. **Настройте email** для отправки уведомлений (если нужно)
7. **Добавьте rate limiting** для API
8. **Резервные копии БД** регулярно
9. **Проверьте логи** `/var/log/nginx/access.log`

---

## 📝 Стек технологий

| Компонент | Версия | Назначение |
|-----------|--------|-----------|
| Python | 3.11+ | Backend язык |
| Django | 4.x | Web framework |
| DRF | 3.x | REST API |
| Node.js | 18+ | Runtime для frontend |
| Next.js | 15.5.3 | React framework |
| React | 19.1.0 | UI library |
| TailwindCSS | 4.x | CSS framework |
| Zustand | 5.x | State management |
| Nginx | Latest | Reverse proxy |
| PostgreSQL/SQLite | Latest | База данных |

---

## 🆘 Troubleshooting

**Проблема:** CORS ошибка
- **Решение:** Проверьте CORS_ALLOWED_ORIGINS в settings.py

**Проблема:** CSRF ошибка
- **Решение:** Убедитесь, что получен CSRF токен через `/api/csrf/`

**Проблема:** Товары не загружаются
- **Решение:** Проверьте наличие записей в БД и `image_directory`

**Проблема:** Telegram бот не отправляет уведомления
- **Решение:** Проверьте TELEGRAM_BOT_TOKEN и запущен ли бот

**Проблема:** Стаутка на localhost:80
- **Решение:** Nginx может быть занят, проверьте порты: `netstat -an | grep 80`

---

✅ **Проект готов к работе!**
