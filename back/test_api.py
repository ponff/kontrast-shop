#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from api.models import Product, PublicMedia
from api.serializers import ProductSerializer

# Получим первый товар
product = Product.objects.first()
print(f'Товар: {product.name}')
print(f'image_directory: {product.image_directory}')

# Сериализуем его
serializer = ProductSerializer(product)
data = serializer.data
print(f'\nAPI ответ:')
print(f'  id: {data.get("id")}')
print(f'  name: {data.get("name")}')
print(f'  images: {data.get("images")}')
print(f'  image_preview: {data.get("image_preview")}')

# Проверим, что ищет сериализатор
images = PublicMedia.objects.filter(target_dir=product.image_directory)
print(f'\nФото с target_dir={product.image_directory}: {images.count()}')
for img in images:
    print(f'  - {img.file.url}')

# Покажем какое фото загружено
print(f'\nВсе загруженные фото:')
for img in PublicMedia.objects.all():
    print(f'  target_dir={img.target_dir}, file={img.file.name}, url={img.file.url}')
