from django.core.management.base import BaseCommand
from api.models import Category, Product


class Command(BaseCommand):
    help = 'Загружает начальные данные: 5 категорий и по 5 товаров для каждой'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Очистить существующие данные перед загрузкой',
        )

    def handle(self, *args, **options):
        # Проверяем, существуют ли уже категории
        if Category.objects.exists():
            if options['clear']:
                self.stdout.write(self.style.WARNING('Удаление существующих данных...'))
                Product.objects.all().delete()
                Category.objects.all().delete()
            else:
                self.stdout.write(self.style.WARNING('Категории уже существуют. Используйте --clear для очистки.'))
                return

        # Создаем категории кожаных изделий ручной работы
        categories_data = [
            {
                'name': 'Сумки',
                'description': 'Кожаные сумки ручной работы',
                'order': 1,
            },
            {
                'name': 'Кошельки',
                'description': 'Кожаные кошельки ручной работы',
                'order': 2,
            },
            {
                'name': 'Ремни',
                'description': 'Кожаные ремни ручной работы',
                'order': 3,
            },
            {
                'name': 'Обувь',
                'description': 'Кожаная обувь ручной работы',
                'order': 4,
            },
            {
                'name': 'Аксессуары',
                'description': 'Кожаные аксессуары ручной работы',
                'order': 5,
            },
        ]

        categories = {}
        category_to_folder = {
            'Сумки': 'sumki',
            'Кошельки': 'koshelki',
            'Ремни': 'remni',
            'Обувь': 'obuv',
            'Аксессуары': 'aksessuary',
        }
        for cat_data in categories_data:
            category = Category.objects.create(**cat_data)
            categories[category.name] = category
            self.stdout.write(self.style.SUCCESS(f'✓ Категория создана: {category.name}'))

        # Создаем товары для каждой категории
        products_data = {
            'Сумки': [
                {'name': 'Сумка-тоут "Классика"', 'description': 'Просторная кожаная сумка-тоут ручной работы из натуральной кожи', 'self_price': 8500},
                {'name': 'Сумка-мессенджер "Путешественник"', 'description': 'Функциональная сумка-мессенджер с ремешком через плечо', 'self_price': 7200},
                {'name': 'Рюкзак кожаный "Авантюрист"', 'description': 'Вместительный кожаный рюкзак ручной работы для путешествий', 'self_price': 10500},
                {'name': 'Сумка "Вечерняя"', 'description': 'Элегантная вечерняя сумка из мягкой кожи', 'self_price': 6500},
                {'name': 'Сумка-саквояж "Ретро"', 'description': 'Стильный саквояж в винтажном стиле из коричневой кожи', 'self_price': 9000},
            ],
            'Кошельки': [
                {'name': 'Кошелек "Минималист"', 'description': 'Компактный кожаный кошелек на молнии', 'self_price': 2200},
                {'name': 'Кошелек-портмоне "Классический"', 'description': 'Большой кошелек для монет и купюр ручной работы', 'self_price': 2800},
                {'name': 'Клатч кожаный "Элегант"', 'description': 'Длинный кожаный клатч с отделениями для карт', 'self_price': 3500},
                {'name': 'Монетница "Компакт"', 'description': 'Маленькая кожаная монетница на магните', 'self_price': 1500},
                {'name': 'Кошелек "Бизнес"', 'description': 'Двойной кошелек из натуральной коричневой кожи', 'self_price': 3200},
            ],
            'Ремни': [
                {'name': 'Ремень "Классический"', 'description': 'Классический кожаный ремень с металлической пряжкой', 'self_price': 2000},
                {'name': 'Ремень "Премиум"', 'description': 'Широкий кожаный ремень из премиум кожи с декоративной пряжкой', 'self_price': 3000},
                {'name': 'Ремень "Этно"', 'description': 'Кожаный ремень с этническим орнаментом', 'self_price': 2500},
                {'name': 'Ремень "Военный"', 'description': 'Плотный кожаный ремень в военном стиле', 'self_price': 2300},
                {'name': 'Ремень "Джинсовый"', 'description': 'Гибкий кожаный ремень для джинсов с кольцом', 'self_price': 1800},
            ],
            'Обувь': [
                {'name': 'Мокасины "Комфорт"', 'description': 'Удобные мокасины из мягкой кожи ручной работы', 'self_price': 6500},
                {'name': 'Ботинки "Классик"', 'description': 'Классические кожаные ботинки на шнуровке', 'self_price': 8000},
                {'name': 'Сандали "Летние"', 'description': 'Открытые кожаные сандали для летнего сезона', 'self_price': 4500},
                {'name': 'Тапочки домашние "Уют"', 'description': 'Мягкие домашние тапочки из натуральной кожи', 'self_price': 2500},
                {'name': 'Туфли "Деловые"', 'description': 'Элегантные кожаные туфли для деловых встреч', 'self_price': 7500},
            ],
            'Аксессуары': [
                {'name': 'Обложка для паспорта', 'description': 'Кожаная обложка для паспорта ручной работы', 'self_price': 1200},
                {'name': 'Чехол для ключей', 'description': 'Практичный кожаный чехол для ключей', 'self_price': 900},
                {'name': 'Браслет кожаный', 'description': 'Стильный браслет из черной кожи с металлическими элементами', 'self_price': 1500},
                {'name': 'Закладка для книги', 'description': 'Декоративная кожаная закладка с кисточкой', 'self_price': 600},
                {'name': 'Ошейник для животного', 'description': 'Кожаный ошейник с регулировкой для собак и кошек', 'self_price': 1800},
            ],
        }

        product_counter = 1
        for category_name, products in products_data.items():
            category = categories[category_name]
            for product_data in products:
                product = Product.objects.create(
                    category=category,
                    image_directory=f"products/{product_counter}",
                    **product_data
                )
                self.stdout.write(f'  ✓ Товар создан: {product.name} ({category_name}) → папка: products/{product_counter}')
                product_counter += 1

        self.stdout.write(self.style.SUCCESS('\n✓ Начальные данные успешно загружены!'))
        self.stdout.write(f'Создано категорий: {Category.objects.count()}')
        self.stdout.write(f'Создано товаров: {Product.objects.count()}')
        self.stdout.write(self.style.WARNING('\n📁 Структура папок для фото:'))
        self.stdout.write('   back/media/products/1/  ← фото для товара #1')
        self.stdout.write('   back/media/products/2/  ← фото для товара #2')
        self.stdout.write('   ... и так далее до products/25/')
        self.stdout.write('\n   back/media/categories/sumki/       ← фото для категории "Сумки"')
        self.stdout.write('   back/media/categories/koshelki/    ← фото для категории "Кошельки"')
        self.stdout.write('   back/media/categories/remni/       ← фото для категории "Ремни"')
        self.stdout.write('   back/media/categories/obuv/        ← фото для категории "Обувь"')
        self.stdout.write('   back/media/categories/aksessuary/  ← фото для категории "Аксессуары"')
        self.stdout.write(self.style.WARNING('\n💡 Как загружать фото:'))
        self.stdout.write('   1. Скопируйте изображения JPG/PNG в соответствующие папки')
        self.stdout.write('   2. Откройте админ-панель http://localhost:8000/admin/api/publicmedia/')
        self.stdout.write('   3. Нажмите "Add PublicMedia" и загрузите фото')
        self.stdout.write('   4. Укажите target_dir (например: "products/1" для первого товара)')
        self.stdout.write('   5. Сохраните — фото появится на странице товара!')
