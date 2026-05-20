from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Product, Order, CustomOrder, PublicMedia, TelegramUser, Category, UserProfile
from api.cart import Cart

User = get_user_model()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "description",
            "image",
            "order",
        ]
        read_only_fields = ["id"]


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            "patronymic",
            "phone",
            "address",
            "city",
            "postal_code",
        ]
        read_only_fields = ["patronymic", "phone", "address", "city", "postal_code"]


class AuthUserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    orders = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "profile",
            "orders",
        ]

    def get_orders(self, obj):
        return OrderSerializer(obj.orders.all(), many=True).data


class PublicMediaSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()
    file_type = serializers.ReadOnlyField()
    file_size = serializers.ReadOnlyField()
    readable_size = serializers.ReadOnlyField()

    class Meta:
        model = PublicMedia
        fields = [
            "id",
            "file",
            "file_url",
            "uploaded_at",
            "target_dir",
            "file_type",
            "file_size",
            "readable_size",
        ]
        read_only_fields = ["uploaded_at", "file_type", "file_size", "readable_size"]

    def validate_file(self, value):
        max_size = 50 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Размер файла не должен превышать 10MB")
        return value

    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None


class ProductSerializer(serializers.ModelSerializer):
    images = serializers.SerializerMethodField()
    image_preview = serializers.SerializerMethodField()
    price = serializers.ReadOnlyField()
    category = CategorySerializer(read_only=True)
    category_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "description",
            "category",
            "category_id",
            "image_directory",
            "self_price",
            "price",
            "image_preview",
            "images",  
        ]
        read_only_fields = ["price"]

    def get_images(self, obj):
        """Возвращает список URL изображений для товара"""
        if obj.image_directory:
            images = PublicMedia.objects.filter(target_dir=obj.image_directory)
            return [img.file.url for img in images]
        return []

    def get_image_preview(self, obj):
        return obj.image_preview()

    def validate_self_price(self, value):
        if value < 0:
            raise serializers.ValidationError(
                "Себестоимость не может быть отрицательной"
            )
        return value


class OrderItemSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    product_name = serializers.CharField()
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(max_digits=10, decimal_places=2)
    total = serializers.DecimalField(max_digits=10, decimal_places=2)


class OrderSerializer(serializers.ModelSerializer):
    orders_list = serializers.JSONField(required=False)  # Добавлено required=False
    summary_price = serializers.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        required=False  # Добавлено required=False
    )
    order_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "full_name",
            "phone",
            "mail",
            "order_date",
            "address",
            "orders_list",
            "summary_price",
            "comment",
            "is_approve",  
            "is_paid"      
        ]
        read_only_fields = ["order_date", "is_approve", "is_paid"]

    def create(self, validated_data):
        # Получаем request из контекста
        request = self.context.get('request')
        if request:
            # Получаем корзину и добавляем данные автоматически
            cart = Cart(request)
            validated_data['orders_list'] = cart.get_orders_list()
            validated_data['summary_price'] = cart.get_total_price()
        
        return super().create(validated_data)


class CustomOrderSerializer(serializers.ModelSerializer):
    order_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = CustomOrder
        fields = [
            "id", 
            "full_name", 
            "phone", 
            "mail", 
            "order_date", 
            "comment", 
            "is_approve",  
            "is_paid"      
        ]
        read_only_fields = ["order_date"]

    def validate_phone(self, value):
        if (
            not value.replace("+", "")
            .replace(" ", "")
            .replace("-", "")
            .replace("(", "")
            .replace(")", "")
            .isdigit()
        ):
            raise serializers.ValidationError("Некорректный формат телефона")
        return value


class OrderListSerializer(serializers.ModelSerializer):
    order_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = Order
        fields = [
            "id", 
            "full_name", 
            "phone", 
            "order_date", 
            "summary_price", 
            "is_approve",  
            "is_paid"      
        ]


class CustomOrderListSerializer(serializers.ModelSerializer):
    order_date = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S")

    class Meta:
        model = CustomOrder
        fields = [
            "id", 
            "full_name", 
            "phone", 
            "order_date", 
            "is_approve",  
            "is_paid"      
        ]


class TelegramUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = TelegramUser
        fields = ['user_id', 'username', 'first_name', 'last_name', 'notifications_enabled', 'created_at']