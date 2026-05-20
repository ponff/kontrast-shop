# api/views.py
from venv import logger
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from rest_framework import generics, status, serializers
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from django_ratelimit.decorators import ratelimit
from django.utils.decorators import method_decorator
from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
    OpenApiExample,
    OpenApiParameter,
)
from django.contrib.auth.models import User
from api.models import Product, Order, CustomOrder, Category
from api.cart import Cart
from django.http import JsonResponse
from api.telegram_notification import Notify
from .serializers import ProductSerializer, OrderSerializer, CustomOrderSerializer, CategorySerializer, AuthUserSerializer

class CSRFTokenView(APIView):
    def get(self, request):
        token = get_token(request)
        response = JsonResponse({'csrfToken': token})
        # Явно устанавливаем куку для CSRF
        response.set_cookie(
            'csrftoken',
            token,
            max_age=60 * 60 * 24,
            httponly=True,
            samesite='Strict',
            secure=True
        )
        return response

class ProductListAPIView(generics.ListAPIView):
    serializer_class = ProductSerializer

    @extend_schema(
        summary="Список товаров",
        description="""
        Получить полный список всех доступных товаров в магазине.
        
        Параметры фильтрации:
        - category_id (опционально): Фильтр по ID категории
        
        В ответе вы получите:
        - ID товара
        - Название товара
        - Описание
        - Цену
        - Категорию
        - Изображения
        """,
        parameters=[
            OpenApiParameter(
                name="category_id",
                description="ID категории для фильтрации",
                required=False,
                type=int,
            )
        ],
        responses={200: ProductSerializer(many=True)},
    )
    def get_queryset(self):
        queryset = Product.objects.all().select_related('category')
        category_id = self.request.query_params.get('category_id')
        
        if category_id:
            queryset = queryset.filter(category_id=category_id)
        
        return queryset

    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class CategoryListAPIView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    @extend_schema(
        summary="Список категорий",
        description="""
        Получить список всех категорий товаров.
        
        В ответе вы получите:
        - ID категории
        - Название категории
        - Описание
        - Изображение категории
        - Порядок сортировки
        """,
        responses={200: CategorySerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)

class ProductDetailAPIView(APIView):
    @extend_schema(
        summary="Получить товар по ID",
        description="""
        Получить подробную информацию о конкретном товаре по его ID.
        
        В ответе вы получите:
        - ID товара
        - Название товара
        - Описание
        - Цену
        - Изображения
        - Доступное количество
        - Дату создания
        """,
        responses={
            200: ProductSerializer,
            404: inline_serializer(
                name="ProductNotFoundError",
                fields={"error": serializers.CharField(help_text="Товар не найден")}
            )
        }
    )
    def get(self, request, product_id):
        product = get_object_or_404(Product, id=product_id)
        serializer = ProductSerializer(product)
        return Response(serializer.data)

class OrdersListAPIView(generics.ListAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer

    @extend_schema(
        summary="Список заказов",
        description="""
        Получить список всех заказов системы.
        
        ⚠️ Внимание: Этот endpoint доступен только администраторам.
        
        Информация о заказе включает:
        - Данные клиента (ФИО, телефон, email)
        - Адрес доставки
        - Список товаров в заказе
        - Общую стоимость
        - Статус заказа
        - Комментарий клиента
        """,
        responses={200: OrderSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CustomOrderListAPIView(generics.ListAPIView):
    queryset = CustomOrder.objects.all()
    serializer_class = CustomOrderSerializer

    @extend_schema(
        summary="Список индивидуальных заказов",
        description="""
        Получить список всех индивидуальных заказов.
        
        ⚠️ Внимание: Этот endpoint доступен только администраторам.
        
        Индивидуальные заказы - это запросы на:
        - Изготовление товаров по индивидуальному проекту
        - Кастомизацию существующих товаров
        - Специальные услуги под заказ
        
        Каждый заказ содержит описание пожеланий клиента.
        """,
        responses={200: CustomOrderSerializer(many=True)},
    )
    def get(self, request, *args, **kwargs):
        return super().get(request, *args, **kwargs)


class CartAddView(APIView):
    @extend_schema(
        summary="Добавить товар в корзину",
        description="""
        Добавить товар в корзину покупок.
        
        📝 Как использовать:
        1. Найдите ID нужного товара через endpoint /api/products/
        2. Укажите количество товара (по умолчанию 1)
        3. Товар будет добавлен в вашу корзину
        
        🔒 Корзина хранится в сессии и будет доступна до закрытия браузера
        (или до очистки cookies).
        
        ⚠️ Ограничения:
        - Максимальное количество одного товара: 10000 шт
        - Нельзя добавить больше товара, чем есть на складе
        """,
        request=inline_serializer(
            name="CartAddRequest",
            fields={
                "quantity": serializers.IntegerField(
                    min_value=1,
                    max_value=10000,
                    default=1,
                    help_text="Количество товара (от 1 до 10000)",
                )
            },
        ),
        responses={
            200: inline_serializer(
                name="CartAddResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                    "cart_count": serializers.IntegerField(
                        help_text="Общее количество товаров в корзине"
                    ),
                },
            ),
            400: inline_serializer(
                name="CartAddError",
                fields={"error": serializers.CharField(help_text="Описание ошибки")},
            ),
            404: inline_serializer(
                name="NotFoundError",
                fields={"error": serializers.CharField(help_text="Товар не найден")},
            ),
        },
        examples=[
            OpenApiExample(
                "Успешное добавление",
                value={
                    "success": True,
                    "message": "Товар добавлен в корзину",
                    "cart_count": 3,
                },
                response_only=True,
            ),
            OpenApiExample(
                "Ошибка количества",
                value={"error": "Недостаточно товара на складе. Доступно: 5"},
                response_only=True,
            ),
        ],
    )
    def post(self, request, product_id):
        cart = Cart(request)
        product = get_object_or_404(Product, id=product_id)

        quantity = int(request.data.get("quantity", 1))

        # Валидация
        if quantity < 1:
            return Response(
                {"error": "Количество должно быть не менее 1"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > 10000:
            return Response(
                {"error": "Максимальное количество товара - 10000"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart.add(product, quantity)

        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"success": True, "message": "Товар добавлен в корзину", "cart_count": len(cart)})

        return Response(
            {
                "success": True,
                "message": "Товар добавлен в корзину",
                "cart_count": len(cart),
            },
            status=status.HTTP_200_OK,
        )


class CartRemoveView(APIView):
    @extend_schema(
        summary="Удалить товар из корзины",
        description="""
        Полностью удалить товар из корзины покупок.
        
        📝 Как использовать:
        1. Найдите ID товара в корзине
        2. Отправьте запрос на удаление
        3. Товар будет полностью удален из корзины
        
        💡 Примечание: Если товара нет в корзине, запрос все равно вернет успех.
        """,
        responses={
            200: inline_serializer(
                name="CartRemoveResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                    "cart_count": serializers.IntegerField(
                        help_text="Общее количество товаров в корзине после удаления"
                    ),
                },
            )
        },
        examples=[
            OpenApiExample(
                "Успешное удаление",
                value={
                    "success": True,
                    "message": "Товар удален из корзины",
                    "cart_count": 2,
                },
                response_only=True,
            )
        ],
    )
    def post(self, request, product_id):
        cart = Cart(request)
        product = get_object_or_404(Product, id=product_id)
        cart.remove(product)

        if request.headers.get("x-requested-with") == "XMLHttpRequest":
            return JsonResponse({"success": True, "message": "Товар удален из корзины", "cart_count": len(cart)})

        return Response(
            {
                "success": True,
                "message": "Товар удален из корзины",
                "cart_count": len(cart),
            },
            status=status.HTTP_200_OK,
        )


class CartUpdateView(APIView):
    @extend_schema(
        summary="Изменить количество товара в корзине",
        description="""
        Изменить количество конкретного товара в корзине.
        
        📝 Как использовать:
        1. Укажите ID товара в URL
        2. В теле запроса укажите новое количество
        3. Если указать 0 - товар будет удален из корзины
        
        💡 Полезно знать:
        - Можно уменьшать и увеличивать количество
        - Нельзя установить отрицательное количество
        - Максимум 100 шт одного товара
        - Нельзя установить больше, чем есть на складе
        """,
        request=inline_serializer(
            name="CartUpdateRequest",
            fields={
                "quantity": serializers.IntegerField(
                    min_value=0,
                    max_value=100,
                    help_text="Новое количество товара (0 для удаления, от 1 до 100)",
                )
            },
        ),
        responses={
            200: inline_serializer(
                name="CartUpdateResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                    "cart_count": serializers.IntegerField(
                        help_text="Общее количество товаров в корзине"
                    ),
                    "updated_quantity": serializers.IntegerField(
                        help_text="Установленное количество товара"
                    ),
                },
            ),
            400: inline_serializer(
                name="CartUpdateError",
                fields={"error": serializers.CharField(help_text="Описание ошибки")},
            ),
        },
        examples=[
            OpenApiExample(
                "Увеличение количества", value={"quantity": 3}, request_only=True
            ),
            OpenApiExample("Удаление товара", value={"quantity": 0}, request_only=True),
            OpenApiExample(
                "Успешное обновление",
                value={
                    "success": True,
                    "message": "Количество товара обновлено",
                    "cart_count": 5,
                    "updated_quantity": 3,
                },
                response_only=True,
            ),
        ],
    )
    def post(self, request, product_id):
        cart = Cart(request)
        product = get_object_or_404(Product, id=product_id)

        quantity = request.data.get("quantity")

        # Валидация
        if quantity is None:
            return Response(
                {"error": "Параметр quantity обязателен"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            quantity = int(quantity)
        except (ValueError, TypeError):
            return Response(
                {"error": "quantity должен быть целым числом"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity < 0:
            return Response(
                {"error": "Количество не может быть отрицательным"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if quantity > 100:
            return Response(
                {"error": "Максимальное количество товара - 100"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if hasattr(product, "quantity") and quantity > product.quantity:
            return Response(
                {
                    "error": f"Недостаточно товара на складе. Доступно: {product.quantity}"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart.update(product, quantity)

        return Response(
            {
                "success": True,
                "message": "Количество товара обновлено",
                "cart_count": len(cart),
                "updated_quantity": quantity,
            },
            status=status.HTTP_200_OK,
        )


class CartClearView(APIView):
    @extend_schema(
        summary="Очистить всю корзину",
        description="""
        Полностью очистить корзину покупок.
        
        ⚠️ Внимание: Это действие нельзя отменить!
        Все товары будут удалены из корзины.
        
        💡 Используйте осторожно, особенно если в корзине много товаров.
        """,
        responses={
            200: inline_serializer(
                name="CartClearResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                },
            )
        },
        examples=[
            OpenApiExample(
                "Успешная очистка",
                value={"success": True, "message": "Корзина очищена"},
                response_only=True,
            )
        ],
    )
    def post(self, request):
        cart = Cart(request)
        cart.clear()
        return Response(
            {"success": True, "message": "Корзина очищена"}, status=status.HTTP_200_OK
        )


class CartDetailView(APIView):
    @extend_schema(
        summary="Просмотр корзины",
        description="""
        Получить полную информацию о текущем состоянии корзины.
        
        📊 В ответе вы получите:
        - Список всех товаров в корзине
        - Количество каждого товара
        - Цену за единицу и общую стоимость по каждому товару
        - Общую стоимость всей корзины
        - Общее количество товаров
        
        💡 Эта информация полезна для отображения корзины на фронтенде.
        """,
        responses={
            200: inline_serializer(
                name="CartDetailResponse",
                fields={
                    "cart_items": serializers.ListField(
                        child=inline_serializer(
                            name="CartItem",
                            fields={
                                "id": serializers.IntegerField(help_text="ID товара"),
                                "name": serializers.CharField(
                                    help_text="Название товара"
                                ),
                                "price": serializers.CharField(
                                    help_text="Цена за единицу"
                                ),
                                "quantity": serializers.IntegerField(
                                    help_text="Количество"
                                ),
                                "total_price": serializers.CharField(
                                    help_text="Общая стоимость позиции"
                                ),
                            },
                        )
                    ),
                    "total_price": serializers.CharField(
                        help_text="Общая стоимость корзины"
                    ),
                    "cart_count": serializers.IntegerField(
                        help_text="Общее количество товаров"
                    ),
                },
            )
        },
        examples=[
            OpenApiExample(
                "Корзина с товарами",
                value={
                    "cart_items": [
                        {
                            "id": 1,
                            "name": "Сумка",
                            "price": "29999.00",
                            "quantity": 2,
                            "total_price": "59998.00",
                        },
                        {
                            "id": 3,
                            "name": "Ремень",
                            "price": "999.00",
                            "quantity": 1,
                            "total_price": "999.00",
                        },
                    ],
                    "total_price": "60997.00",
                    "cart_count": 3,
                },
                response_only=True,
            )
        ],
    )
    def get(self, request):
        cart = Cart(request)
        cart_items = []
        for item in cart:
            product = item["product"]
            cart_items.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "price": str(product.price),
                    "quantity": item["quantity"],
                    "total_price": str(item["total_price"]),
                }
            )

        return Response(
            {
                "cart_items": cart_items,
                "total_price": str(cart.get_total_price()),
                "cart_count": len(cart),
            },
            status=status.HTTP_200_OK,
        )


class AuthMeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Текущий пользователь",
        description="Получить данные текущего вошедшего пользователя и список его заказов.",
        responses={200: AuthUserSerializer},
    )
    def get(self, request):
        serializer = AuthUserSerializer(request.user, context={"request": request})
        return Response(serializer.data)


class AuthRegisterView(APIView):
    @extend_schema(
        summary="Регистрация пользователя",
        request=inline_serializer(
            name="RegisterRequest",
            fields={
                "email": serializers.EmailField(help_text="Email"),
                "password": serializers.CharField(help_text="Пароль"),
                "first_name": serializers.CharField(help_text="Имя"),
                "last_name": serializers.CharField(help_text="Фамилия"),
                "patronymic": serializers.CharField(required=False, allow_blank=True, help_text="Отчество"),
                "phone": serializers.CharField(required=False, allow_blank=True, help_text="Телефон"),
                "address": serializers.CharField(required=False, allow_blank=True, help_text="Адрес"),
                "city": serializers.CharField(required=False, allow_blank=True, help_text="Город"),
                "postal_code": serializers.CharField(required=False, allow_blank=True, help_text="Почтовый индекс"),
            },
        ),
        responses={200: AuthUserSerializer, 400: inline_serializer(name="RegisterError", fields={"error": serializers.CharField()})},
    )
    def post(self, request):
        data = request.data
        email = data.get("email", "").strip()
        password = data.get("password", "").strip()
        first_name = data.get("first_name", "").strip()
        last_name = data.get("last_name", "").strip()
        patronymic = data.get("patronymic", "").strip()
        phone = data.get("phone", "").strip()
        address = data.get("address", "").strip()
        city = data.get("city", "").strip()
        postal_code = data.get("postal_code", "").strip()

        if not all([email, password, first_name, last_name]):
            return Response(
                {"error": "Заполните email, пароль, имя и фамилию"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username=email).exists():
            return Response(
                {"error": "Пользователь с таким email уже существует"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )
        user.profile.phone = phone
        user.profile.patronymic = patronymic
        user.profile.address = address
        user.profile.city = city
        user.profile.postal_code = postal_code
        user.profile.save()

        login(request, user)
        Cart(request).transfer_session_cart_to_user()
        serializer = AuthUserSerializer(user, context={"request": request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class AuthLoginView(APIView):
    @extend_schema(
        summary="Вход пользователя",
        request=inline_serializer(
            name="LoginRequest",
            fields={
                "email": serializers.EmailField(help_text="Email"),
                "password": serializers.CharField(help_text="Пароль"),
            },
        ),
        responses={200: AuthUserSerializer, 400: inline_serializer(name="LoginError", fields={"error": serializers.CharField()})},
    )
    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()

        if not email or not password:
            return Response(
                {"error": "Укажите email и пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(request, username=email, password=password)
        if user is None:
            return Response(
                {"error": "Неверный email или пароль"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        login(request, user)
        Cart(request).transfer_session_cart_to_user()
        serializer = AuthUserSerializer(user, context={"request": request})
        return Response(serializer.data)


class AuthLogoutView(APIView):
    @extend_schema(
        summary="Выход пользователя",
        responses={200: inline_serializer(name="LogoutResponse", fields={"success": serializers.BooleanField()})},
    )
    def post(self, request):
        logout(request)
        return Response({"success": True})


@method_decorator(ratelimit(key='ip', rate='5/h', method='POST'), name='dispatch')
class CreateOrderView(generics.CreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    @extend_schema(
        summary="Создать заказ из корзины",
        description="""
        Оформить заказ на основе товаров в корзине.
        
        📦 После успешного оформления:
        - Заказ сохраняется в системе
        - Корзина автоматически очищается
        - Вы получаете номер заказа для отслеживания
        
        📋 Обязательные поля:
        - ФИО получателя
        - Телефон для связи
        - Email для уведомлений
        - Адрес доставки
        
        💡 Комментарий к заказу - необязательное поле.
        """,
        request=inline_serializer(
            name="CreateOrderRequest",
            fields={
                "full_name": serializers.CharField(help_text="ФИО получателя"),
                "phone": serializers.CharField(help_text="Телефон для связи"),
                "mail": serializers.EmailField(help_text="Email для уведомлений"),
                "address": serializers.CharField(help_text="Адрес доставки"),
                "comment": serializers.CharField(
                    required=False,
                    allow_blank=True,
                    help_text="Комментарий к заказу (необязательно)",
                ),
            },
        ),
        responses={
            201: inline_serializer(
                name="CreateOrderResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                    "order_id": serializers.IntegerField(
                        help_text="Номер созданного заказа"
                    ),
                },
            ),
            400: inline_serializer(
                name="CreateOrderError",
                fields={"error": serializers.CharField(help_text="Описание ошибки")},
            ),
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "full_name": "Иванов Иван Иванович",
                    "phone": "+7 (999) 123-45-67",
                    "mail": "ivanov@example.com",
                    "address": "г. Москва, ул. Примерная, д. 1, кв. 1",
                    "comment": "Прошу позвонить за час до доставки",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Успешное оформление",
                value={
                    "success": True,
                    "message": "Заказ успешно создан",
                    "order_id": 42,
                },
                response_only=True,
            ),
        ],
    )
    
    def post(self, request):
        if getattr(request, 'limited', False):
            return Response(
                {
                    "status": "error", 
                    "message": "От вас поступило слишком много заявок. Пожалуйста, попробуйте через час."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        cart = Cart(request)
        # Проверяем, что корзина не пустая
        if len(cart) == 0:
            return Response(
                {"error": "Корзина пуста. Добавьте товары перед оформлением заказа."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        full_name = request.data.get("full_name", "").strip()
        phone = request.data.get("phone", "").strip()
        mail = request.data.get("mail", "").strip()
        address = request.data.get("address", "").strip()
        comment = request.data.get("comment", "").strip()

        if not all([full_name, phone, mail, address]):
            return Response(
                {
                    "error": "Заполните все обязательные поля: ФИО, телефон, email и адрес"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        order = Order(
            user=request.user if request.user.is_authenticated else None,
            full_name=full_name,
            phone=phone,
            mail=mail,
            address=address,
            orders_list=cart.get_orders_list(),
            summary_price=cart.get_total_price(),
            comment=comment,
        )
        
        # Проверка ratelimit должна быть перед сохранением
        if getattr(request, 'limited', False):
            return Response(
                {
                    "status": "error", 
                    "message": "Слишком много заявок с вашего IP адреса. Пожалуйста, попробуйте через час."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        order.save()
        cart.clear()
        
        notify = Notify()  # Создаем экземпляр
        notify.send_telegram_notification_order(order)  # Передаем созданный заказ
        
        return Response(
            {"success": True, "message": "Заказ успешно создан", "order_id": order.id},
            status=status.HTTP_201_CREATED
        )


@method_decorator(ratelimit(key='ip', rate='5/h', method='POST'), name='dispatch')
class CreateCustomOrderView(generics.CreateAPIView):
    queryset = CustomOrder
    serializer_class = CustomOrderSerializer
    @extend_schema(
        summary="Создать индивидуальный заказ",
        description="""
        Создать заказ на индивидуальное изделие или услугу.
        
        🎯 Для чего используется:
        - Изготовление товаров по вашему дизайну
        - Кастомизация существующих товаров
        - Специальные услуги под заказ
        - Нестандартные запросы
        
        📋 Обязательные поля:
        - ФИО заказчика
        - Телефон для связи
        - Email для уведомлений
        - Подробное описание пожеланий
        
        💡 Опишите максимально подробно, что вы хотите получить.
        """,
        request=inline_serializer(
            name="CreateCustomOrderRequest",
            fields={
                "full_name": serializers.CharField(help_text="ФИО заказчика"),
                "phone": serializers.CharField(help_text="Телефон для связи"),
                "mail": serializers.EmailField(help_text="Email для уведомлений"),
                "comment": serializers.CharField(
                    help_text="Подробное описание пожеланий"
                ),
            },
        ),
        responses={
            201: inline_serializer(
                name="CreateCustomOrderResponse",
                fields={
                    "success": serializers.BooleanField(
                        help_text="Успешность операции"
                    ),
                    "message": serializers.CharField(
                        help_text="Сообщение для пользователя"
                    ),
                    "order_id": serializers.IntegerField(
                        help_text="Номер созданного заказа"
                    ),
                },
            ),
            400: inline_serializer(
                name="CreateCustomOrderError",
                fields={"error": serializers.CharField(help_text="Описание ошибки")},
            ),
        },
        examples=[
            OpenApiExample(
                "Пример запроса",
                value={
                    "full_name": "Петрова Анна Сергеевна",
                    "phone": "+7 (916) 765-43-21",
                    "mail": "petrova@example.com",
                    "comment": "Хочу заказать свадебное платье по индивидуальному дизайну. У меня есть эскиз и предпочтения по ткани.",
                },
                request_only=True,
            ),
            OpenApiExample(
                "Успешное создание",
                value={
                    "success": True,
                    "message": "Индивидуальный заказ успешно создан",
                    "order_id": 15,
                },
                response_only=True,
            ),
        ],
    )
    
    def post(self, request):
        notify = Notify()
        full_name = request.data.get("full_name", "").strip()
        phone = request.data.get("phone", "").strip()
        mail = request.data.get("mail", "").strip()
        comment = request.data.get("comment", "").strip()

        if not all([full_name, phone, mail, comment]):
            return Response(
                {
                    "error": "Заполните все обязательные поля: ФИО, телефон, email и описание"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if getattr(request, 'limited', False):
            return Response(
                {
                    "status": "error", 
                    "message": "Слишком много заявок с вашего IP адреса. Пожалуйста, попробуйте через час."
                },
                status=status.HTTP_429_TOO_MANY_REQUESTS
            )
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        application = serializer.save(user=request.user if request.user.is_authenticated else None)
        
        # Отправляем уведомление в Telegram
        try:
            notify.send_telegram_notification_application(application)
        except Exception as e:
            # Логируем, но не мешаем успешному созданию заявки
            import logging
            logging.getLogger(__name__).error(f"Failed to send telegram notification for application: {e}")
        headers = self.get_success_headers(serializer.data)

        return Response(
            
            {"status": "success", "message": "Заявка успешно создана"},
            status=status.HTTP_201_CREATED,
            headers=headers
            
        )
