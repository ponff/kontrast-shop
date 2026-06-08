from django.test import TestCase

from api.models import Category, Product
from api.serializers import ProductSerializer


class ProductSerializerTest(TestCase):
    def test_product_serializer_returns_expected_fields(self):
        category = Category.objects.create(name='Тестовая категория', description='Тест')
        product = Product.objects.create(
            name='Тестовый товар',
            description='Описание товара',
            category=category,
            self_price=100.0,
            quantity=5,
            status='in_stock',
            image_directory='products/test',
        )

        serializer = ProductSerializer(product)

        self.assertEqual(serializer.data['id'], product.id)
        self.assertEqual(serializer.data['name'], product.name)
        self.assertEqual(serializer.data['status'], 'in_stock')
        self.assertIn('images', serializer.data)
        self.assertIn('image_preview', serializer.data)
