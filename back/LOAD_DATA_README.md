# Загрузка начальных данных

В проект добавлен скрипт для загрузки тестовых данных: **5 категорий товаров и по 5 товаров в каждой**.

## 📋 Что загружается

**Категории:**
1. Электроника (5 товаров)
2. Одежда (5 товаров)
3. Мебель (5 товаров)
4. Книги (5 товаров)
5. Спорт (5 товаров)

**Итого: 25 товаров** без изображений, с предустановленными ценами.

## 🚀 Как использовать

### Способ 1: Management команда (в контейнере)

**Загрузить данные (если их еще нет):**
```bash
docker-compose exec backend python manage.py load_initial_data
```

**Очистить и перезагрузить данные:**
```bash
docker-compose exec backend python manage.py load_initial_data --clear
```

### Способ 2: Прямой скрипт (в контейнере)

**Загрузить данные:**
```bash
docker-compose exec backend python load_data.py
```

**Очистить и перезагрузить:**
```bash
docker-compose exec backend python load_data.py --clear
```

### Способ 3: На локальной машине

Если у вас есть локальное окружение:

```bash
cd back
python load_data.py
# или
python manage.py load_initial_data
```

## 📁 Структура скрипта

Основной файл: `back/api/management/commands/load_initial_data.py`

Скрипт содержит:
- Данные для 5 категорий
- По 5 товаров в каждой категории с описанием и ценами
- Проверку существующих данных
- Опцию `--clear` для очистки перед загрузкой

## ✅ Проверка результата

После загрузки данные будут видны в админ-панели:
- http://127.0.0.1:8000/admin/api/category/
- http://127.0.0.1:8000/admin/api/product/

## 🔄 Как изменить данные

Отредактируйте файл `back/api/management/commands/load_initial_data.py`:

1. Измените `categories_data` для категорий
2. Измените `products_data` для товаров
3. Запустите скрипт с флагом `--clear`

## 🗑️ Удаление данных

Чтобы удалить все категории и товары:

```bash
docker-compose exec backend python manage.py shell
>>> from api.models import Category, Product
>>> Product.objects.all().delete()
>>> Category.objects.all().delete()
```

Или просто запустите скрипт с флагом `--clear`.
