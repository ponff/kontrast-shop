# ✅ Чек-лист установки django-grappelli и django-import-export

## Что было сделано:

### 1. ✅ Добавлены пакеты в `requirements.txt`
```
django-grappelli==3.0.8
django-import-export==3.3.1
```

### 2. ✅ Обновлены `settings.py`
- Добавлена `grappelli` в `INSTALLED_APPS` (ДО admin)
- Добавлена `import_export` в `INSTALLED_APPS`

### 3. ✅ Обновлены `urls.py`
- Добавлен маршрут: `path("grappelli/", include("grappelli.urls"))`
- Находится перед `/admin/`

### 4. ✅ Обновлен `admin.py`
- Импортированы `ImportExportModelAdmin` и `resources`
- Созданы Resource классы для:
  - `ProductResource` - для товаров
  - `OrderResource` - для заказов
  - `CustomOrderResource` - для заявок
- Все админ классы наследуют `ImportExportModelAdmin`

### 5. ✅ Обновлен `start.sh`
- Добавлена команда `collectstatic` для сборки статики грапелли

---

## 🚀 Как запустить

### Вариант 1: С Docker (рекомендуется)
```bash
docker compose down
docker compose up -d --build
```

### Вариант 2: Локально
```bash
# Установить зависимости
pip install -r back/requirements.txt

# Миграции
python manage.py migrate

# Собрать статику
python manage.py collectstatic --noinput

# Создать суперпользователя (если нужно)
python manage.py createsuperuser

# Запустить сервер
python manage.py runserver
```

---

## 📍 Где найти функции

| Функция | URL |
|---------|-----|
| Админ-панель | `http://localhost/admin/` |
| Товары | `http://localhost/admin/api/product/` |
| Заказы | `http://localhost/admin/api/order/` |
| Заявки | `http://localhost/admin/api/customorder/` |

---

## 🎨 Особенности django-grappelli

### Кнопки экспорта/импорта
- **Слева вверху** в каждой таблице
- Легко заметны с иконками

### Встроенный поиск
- Правая часть админа
- Ищет по всем полям модели

### Фильтры
- Слева в боковой панели
- Быстрая фильтрация по полям

### Автодополнение
- При выборе Foreign Key
- Начните печатать - появятся подсказки

---

## 📊 Примеры экспорта

### Экспортировать товары в CSV
```
1. /admin/api/product/
2. Нажать "Export" кнопку
3. Выбрать CSV
4. Скачать
```

### Экспортировать заказы в Excel
```
1. /admin/api/order/
2. Выбрать заказы (или все)
3. Нажать "Export"
4. Выбрать Excel (.xlsx)
5. Скачать
```

---

## 🔐 Логин в админ-панель

**По умолчанию:**
- Username: `admin`
- Password: `admin`
- Email: `admin@mail.com`

**Изменить пароль:**
```bash
docker compose exec backend python manage.py changepassword admin
```

---

## 🐛 Если что-то не работает

### Статика не загружается
```bash
# Пересобрать статику
docker compose exec backend python manage.py collectstatic --noinput

# Перезагрузить контейнер
docker compose restart backend
```

### Импорт не работает
```bash
# Проверить логи
docker compose logs backend

# Проверить кодировку CSV (должна быть UTF-8)
```

### "No module named 'grappelli'"
```bash
# Переустановить зависимости
docker compose exec backend pip install -r requirements.txt

# Перезагрузить
docker compose restart backend
```

---

## � Настройка YooKassa

В проект уже подключена библиотека `yookassa` и реализованы:
- создание платежа через `CreateYooKassaPaymentView`
- сохранение `yookassa_payment_id` в заказе
- webhook для смены статуса заказа на `paid` после успешной оплаты
- кнопка оплаты в личном кабинете пользователя

### Что надо настроить в окружении

Установите переменные окружения для backend-конфига:
- `YOO_KASSA_SHOP_ID` — идентификатор магазина YooKassa
- `YOO_KASSA_SECRET_KEY` — секретный ключ магазина
- `YOO_KASSA_RETURN_URL` — URL, на который пользователь вернется после оплаты

Пример для `.env` или Docker:
```bash
YOO_KASSA_SHOP_ID=ваш_shop_id
YOO_KASSA_SECRET_KEY=ваш_secret_key
YOO_KASSA_RETURN_URL=https://ваш-домен.ru/
```

### В YooKassa

1. В личном кабинете YooKassa добавьте URL webhook:
   `https://ваш-домен.ru/api/orders/payment/webhook/`
2. Убедитесь, что доступен HTTPS и запросы принимаются публично.
3. Активируйте магазин и проверьте, что секретный ключ верный.

### Что проверить после настройки

- Заказ создается со статусом `pending_payment`
- В личном кабинете клиента появляется кнопка `Оплатить заказ`
- После успешной оплаты webhook меняет заказ на `paid`
- `is_paid` у заказа становится `True`

---

## �📚 Документация

- [django-grappelli документация](https://django-grappelli.readthedocs.io/)
- [django-import-export документация](https://django-import-export.readthedocs.io/)
- [Гайд импорта/экспорта](./IMPORT_EXPORT_GUIDE.md) - в этом проекте

---

✅ **Всё готово к использованию!**

При запуске контейнера Docker автоматически:
1. Установит зависимости
2. Применит миграции
3. Соберет статику
4. Создаст суперпользователя admin/admin
5. Запустит Django сервер
