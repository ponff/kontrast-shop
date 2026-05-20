from django.contrib import admin
from django import forms
from .models import Product, Order, CustomOrder, PublicMedia, Category, UserProfile, CartItem
from django.utils.safestring import mark_safe
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from unfold.admin import ModelAdmin, TabularInline
from unfold.contrib.filters.admin import RangeNumericFilter


class CategoryForm(forms.ModelForm):
    class Meta:
        model = Category
        fields = "__all__"


class ProductForm(forms.ModelForm):
    class Meta:
        model = Product
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        directories = Product.get_available_directories()
        self.fields["image_directory"].widget = forms.Select(
            choices=[("", "---------")]
            + [(dir_path, dir_path) for dir_path in directories]
        )


# Ресурсы для импорта/экспорта
class ProductResource(resources.ModelResource):
    class Meta:
        model = Product
        fields = ("id", "name", "description", "category", "self_price", "price", "image_directory")
        export_order = ("id", "name", "description", "category", "self_price", "price", "image_directory")


class OrderResource(resources.ModelResource):
    class Meta:
        model = Order
        fields = ("id", "full_name", "phone", "mail", "address", "order_date", "summary_price", "is_approve", "is_paid")
        export_order = ("id", "full_name", "phone", "mail", "address", "order_date", "summary_price", "is_approve", "is_paid")


class CustomOrderResource(resources.ModelResource):
    class Meta:
        model = CustomOrder
        fields = ("id", "full_name", "phone", "mail", "order_date", "comment", "is_approve", "is_paid")
        export_order = ("id", "full_name", "phone", "mail", "order_date", "comment", "is_approve", "is_paid")


@admin.register(Category)
class CategoryAdmin(ModelAdmin):
    form = CategoryForm
    list_display = ["name", "order", "created_at"]
    list_editable = ["order"]
    list_filter = ("created_at", "order")
    fieldsets = (
        ("Основная информация", {
            "fields": ("name", "description"),
        }),
        ("Параметры отображения", {
            "fields": ("image", "order"),
        }),
        ("Служебная информация", {
            "fields": ("created_at",),
            "classes": ("collapse",),
        }),
    )
    readonly_fields = ("created_at",)
    search_fields = ["name"]
    ordering = ["order", "name"]


@admin.register(PublicMedia)
class PublicMediaAdmin(ModelAdmin):
    list_display = ("file_name", "readable_size", "uploaded_at")
    list_filter = ("uploaded_at",)
    search_fields = ("file",)
    readonly_fields = ("file_preview", "file_info", "uploaded_at")

    def file_name(self, obj):
        return obj.original_path

    file_name.short_description = "Файл"

    def readable_size(self, obj):
        return obj.get_readable_size()

    readable_size.short_description = "Размер"

    def file_preview(self, obj):
        if obj.file and obj.file_type in ["jpg", "jpeg", "png", "gif"]:
            return mark_safe(f'<img src="{obj.file.url}" style="max-height: 200px;" />')
        return "Превью недоступно"

    file_preview.short_description = "Превью"

    def file_info(self, obj):
        return f"""
        Путь: {obj.original_path}
        Размер: {obj.get_readable_size()}
        Тип: {obj.file_type}
        Загружен: {obj.uploaded_at}
        """

    file_info.short_description = "Информация"


@admin.register(Product)
class ProductAdmin(ImportExportModelAdmin, ModelAdmin):
    form = ProductForm
    resource_class = ProductResource
    list_display = ["name", "category", "self_price", "price"]
    list_filter = ("category", ("self_price", RangeNumericFilter), "created_at")
    fieldsets = (
        ("Основная информация", {
            "fields": ("name", "description", "category"),
        }),
        ("Цены", {
            "fields": ("self_price", "price"),
        }),
        ("Изображения", {
            "fields": ("image_directory",),
        }),
    )
    readonly_fields = ("price",)
    search_fields = ["name", "description"]
    ordering = ["-id"]
    list_filter = ["category"]
    search_fields = ["name", "category__name"]
    readonly_fields = ["image_preview", "price"]
    form = ProductForm


@admin.register(Order)
class OrderAdmin(ImportExportModelAdmin):
    resource_class = OrderResource
    list_display = ["id", "is_approve", "is_paid", "full_name", "order_date", "summary_price"]  
    readonly_fields = ["order_date", "orders_list", "summary_price"]
    list_filter = ["order_date", "is_approve", "is_paid"]  
    list_editable = ["is_approve", "is_paid"]  


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ["user", "phone", "city", "created_at"]
    readonly_fields = ["created_at", "updated_at"]
    search_fields = ["user__username", "user__email", "phone"]


@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ["user", "product", "quantity", "price", "updated_at"]
    list_filter = ["user", "product"]
    search_fields = ["user__username", "product__name"]
    readonly_fields = ["created_at", "updated_at"]


@admin.register(CustomOrder)
class CustomOrderAdmin(ImportExportModelAdmin):
    resource_class = CustomOrderResource
    list_display = ["id", "is_approve", "is_paid", "full_name", "order_date"]  
    readonly_fields = ["order_date"]
    list_filter = ["order_date", "is_approve", "is_paid"]  
    list_editable = ["is_approve", "is_paid"]  