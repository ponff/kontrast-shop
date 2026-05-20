# 📸 Инструкция по загрузке изображений товаров

## 📁 Структура папок

Все изображения хранятся в папке `back/media/`:

```
back/media/
├── products/          ← Фото товаров
│   ├── 1/            ← Фото товара #1 (Сумка-тоут "Классика")
│   ├── 2/            ← Фото товара #2 (Сумка-мессенджер "Путешественник")
│   ├── 3/            ← Фото товара #3 (Рюкзак "Авантюрист")
│   ├── 4/            ← Фото товара #4 (Сумка "Вечерняя")
│   ├── 5/            ← Фото товара #5 (Сумка-саквояж "Ретро")
│   ├── 6-10/         ← Кошельки
│   ├── 11-15/        ← Ремни
│   ├── 16-20/        ← Обувь
│   └── 21-25/        ← Аксессуары
│
└── categories/        ← Фото категорий
    ├── sumki/        ← Сумки
    ├── koshelki/     ← Кошельки
    ├── remni/        ← Ремни
    ├── obuv/         ← Обувь
    └── aksessuary/   ← Аксессуары
```

## 🎯 Соответствие товаров и папок

| ID | Название | Категория | Папка |
|----|----------|-----------|-------|
| 1 | Сумка-тоут "Классика" | Сумки | products/1 |
| 2 | Сумка-мессенджер "Путешественник" | Сумки | products/2 |
| 3 | Рюкзак "Авантюрист" | Сумки | products/3 |
| 4 | Сумка "Вечерняя" | Сумки | products/4 |
| 5 | Сумка-саквояж "Ретро" | Сумки | products/5 |
| 6 | Кошелек "Минималист" | Кошельки | products/6 |
| 7 | Кошелек-портмоне "Классический" | Кошельки | products/7 |
| 8 | Клатч кожаный "Элегант" | Кошельки | products/8 |
| 9 | Монетница "Компакт" | Кошельки | products/9 |
| 10 | Кошелек "Бизнес" | Кошельки | products/10 |
| 11 | Ремень "Классический" | Ремни | products/11 |
| 12 | Ремень "Премиум" | Ремни | products/12 |
| 13 | Ремень "Этно" | Ремни | products/13 |
| 14 | Ремень "Военный" | Ремни | products/14 |
| 15 | Ремень "Джинсовый" | Ремни | products/15 |
| 16 | Мокасины "Комфорт" | Обувь | products/16 |
| 17 | Ботинки "Классик" | Обувь | products/17 |
| 18 | Сандали "Летние" | Обувь | products/18 |
| 19 | Тапочки "Уют" | Обувь | products/19 |
| 20 | Туфли "Деловые" | Обувь | products/20 |
| 21 | Обложка для паспорта | Аксессуары | products/21 |
| 22 | Чехол для ключей | Аксессуары | products/22 |
| 23 | Браслет кожаный | Аксессуары | products/23 |
| 24 | Закладка для книги | Аксессуары | products/24 |
| 25 | Ошейник для животного | Аксессуары | products/25 |

## 📝 Пошаговая инструкция

### Способ 1️⃣: Через админ-панель (рекомендуемый)

1. **Откройте админ-панель:**
   - Перейдите на `http://localhost:8000/admin/`
   - Введите логин и пароль (по умолчанию `admin/admin`)

2. **Перейдите на страницу загрузки файлов:**
   - Найдите раздел **"PublicMedia"** (если его нет, перезагрузите страницу)
   - Нажмите кнопку **"+ Add PublicMedia"** (или **"Add"**)

3. **Загрузите изображение:**
   - В поле **"File"** нажмите **"Choose File"** и выберите JPG/PNG изображение
   - В поле **"Папка для сохранения" (target_dir)** введите путь, например:
     - `products/1` — для первого товара (Сумка-тоут)
     - `products/2` — для второго товара
     - `categories/sumki` — для категории "Сумки"

4. **Сохраните:**
   - Нажмите кнопку **"Save"** или **"Save and continue editing"**

5. **Проверьте результат:**
   - Откройте главную страницу `http://localhost:3000`
   - Найдите соответствующий товар — фото должно появиться на карточке товара

### Способ 2️⃣: Через Python shell (для программистов)

```bash
docker-compose exec backend python manage.py shell
```

```python
from api.models import PublicMedia
from django.core.files.base import ContentFile

# Загрузить фото для товара #1
with open('back/media/products/1/photo1.jpg', 'rb') as f:
    PublicMedia.objects.create(
        file=ContentFile(f.read(), name='photo1.jpg'),
        target_dir='products/1'
    )

# Загрузить ещё одно фото для того же товара
with open('back/media/products/1/photo2.jpg', 'rb') as f:
    PublicMedia.objects.create(
        file=ContentFile(f.read(), name='photo2.jpg'),
        target_dir='products/1'
    )
```

### Способ 3️⃣: Через cURL (для скриптов)

```bash
curl -X POST http://localhost:8000/api/upload/ \
  -F "file=@/path/to/image.jpg" \
  -F "target_dir=products/1"
```

## ✅ Проверка и отладка

### Если фото не отображается:

1. **Проверьте наличие файлов:**
   ```bash
   ls -la back/media/products/1/
   ```

2. **Проверьте записи в базе:**
   ```bash
   docker-compose exec backend python manage.py shell
   ```
   ```python
   from api.models import PublicMedia, Product
   
   # Проверим товар #1
   product = Product.objects.get(id=1)
   print(f"image_directory: {product.image_directory}")
   
   # Проверим фото для этого товара
   images = PublicMedia.objects.filter(target_dir=product.image_directory)
   print(f"Найдено фото: {images.count()}")
   for img in images:
       print(f"  - {img.file.url}")
   ```

3. **Проверьте API ответ:**
   ```bash
   curl http://localhost:8000/api/products/1/
   ```
   
   Должно быть поле `"images"` с массивом URL.

4. **Очистить кэш фронтенда:**
   ```bash
   docker-compose exec frontend npm run build
   ```

## 📌 Важные замечания

- **Форматы:** JPG, PNG, GIF, WebP (максимум 50MB)
- **Количество фото:** Неограниченно (можно загружать несколько фото для одного товара)
- **Директория:** Всегда используйте формат `products/{id}` или `categories/{name}`
- **URL:** После загрузки фото доступно по адресу `/media/filename.jpg`

## 🚀 Быстрый старт

1. Найдите JPG/PNG изображение товара
2. Откройте админ-панель `http://localhost:8000/admin/api/publicmedia/`
3. Нажмите **"+ Add"**
4. Выберите файл и введите `target_dir` (например, `products/1`)
5. Нажмите **"Save"**
6. Перезагрузите главную страницу — готово! 🎉
