#!/usr/bin/env python
"""
Скрипт для создания тестовых изображений для товаров
"""
import os
import django
from PIL import Image, ImageDraw, ImageFont

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from api.models import PublicMedia, Product
from django.core.files.base import ContentFile

# Создаём папки для фото если их нет
media_root = 'back/media'
os.makedirs(f'{media_root}/products', exist_ok=True)
os.makedirs(f'{media_root}/categories', exist_ok=True)

def create_test_image(text, width=300, height=300, color_r=200, color_g=150, color_b=100):
    """Создаёт простое тестовое изображение"""
    # Создаём изображение
    img = Image.new('RGB', (width, height), color=(color_r, color_g, color_b))
    draw = ImageDraw.Draw(img)
    
    # Добавляем текст (простой, без шрифта)
    text_bbox = draw.textbbox((0, 0), text)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    draw.text((x, y), text, fill=(255, 255, 255))
    
    return img

def load_images_for_products():
    """Загружает тестовые изображения для всех товаров"""
    products = Product.objects.all().order_by('id')
    
    print(f'📸 Загружаю тестовые изображения для {products.count()} товаров...\n')
    
    for idx, product in enumerate(products, 1):
        # Пропускаем товары, которые уже имеют фото
        existing_images = PublicMedia.objects.filter(target_dir=product.image_directory)
        if existing_images.exists():
            print(f'✅ Товар #{product.id} ({product.name}) - уже есть {existing_images.count()} фото')
            continue
        
        # Создаём тестовое изображение
        colors = [
            (200, 100, 100),  # Красный
            (100, 200, 100),  # Зелёный
            (100, 100, 200),  # Синий
            (200, 200, 100),  # Жёлтый
            (200, 100, 200),  # Розовый
        ]
        color = colors[(idx - 1) % len(colors)]
        
        img = create_test_image(f'Товар #{product.id}', 300, 300, *color)
        
        # Сохраняем в буффер
        from io import BytesIO
        buffer = BytesIO()
        img.save(buffer, format='JPEG', quality=85)
        buffer.seek(0)
        
        # Загружаем в базу
        filename = f'test_product_{product.id}.jpg'
        PublicMedia.objects.create(
            file=ContentFile(buffer.read(), name=filename),
            target_dir=product.image_directory
        )
        
        print(f'✅ Товар #{product.id} ({product.name}) → {product.image_directory}/{filename}')
    
    print(f'\n✓ Готово! Загружено изображений: {PublicMedia.objects.count()}')

if __name__ == '__main__':
    load_images_for_products()
