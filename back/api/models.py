import os
from decimal import Decimal, ROUND_HALF_UP

from django.conf import settings
from django.contrib.auth.models import User
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.serializers.json import DjangoJSONEncoder
from django.db import models
from django.forms import ValidationError
from django.utils.safestring import mark_safe


class Category(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Название категории")
    description = models.TextField(verbose_name="Описание", blank=True)
    image = models.ImageField(upload_to="categories/", verbose_name="Изображение категории", blank=True, null=True)
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок сортировки")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")

    class Meta:
        verbose_name = "Категория"
        verbose_name_plural = "Категории"
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=255, verbose_name="Название")
    description = models.TextField(verbose_name="Описание", blank=True)
    category = models.ForeignKey(Category, on_delete=models.PROTECT, verbose_name="Категория", null=True, blank=True)

    image_directory = models.CharField(
        max_length=255,
        verbose_name="Папка с фото",
        blank=True,
        null=True,
    )

    self_price = models.FloatField(default=0.00, verbose_name="Себестоимость")
    price = models.FloatField(
        default=0.00, verbose_name="Цена с наценкой", editable=False
    )

    class Meta:
        verbose_name = "Товар"
        verbose_name_plural = "Товары"

    def __str__(self):
        return f"{self.name}"

    @classmethod
    def get_available_directories(cls):
        return PublicMedia.objects.values_list("target_dir", flat=True).distinct()

    def save(self, *args, **kwargs):
        self.price = self.calculate_price()
        super().save(*args, **kwargs)

    def calculate_price(self):
        MARKUP_PERCENT = Decimal("10")
        result = Decimal(str(self.self_price)) * (1 + MARKUP_PERCENT / Decimal("100"))
        return result.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

    @property
    def images(self):
        if self.image_directory:
            return PublicMedia.objects.filter(target_dir=self.image_directory)
        return PublicMedia.objects.none()  # Возвращаем QuerySet, а не список

    def image_preview(self):
        imgs = self.images
        if imgs.exists():  # Теперь работает, т.к. это QuerySet
            previews = "".join([
                f'<img src="{img.file.url}" width="120" style="margin:5px;" />'
                for img in imgs
            ])
            return mark_safe(previews)
        return "Нет фото"


    image_preview.short_description = "Предпросмотр фото"


class Order(models.Model):
    full_name = models.CharField(max_length=300, verbose_name="ФИО")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    mail = models.EmailField(verbose_name="Email")
    order_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата заказа")
    address = models.TextField(verbose_name="Адрес")
    orders_list = models.JSONField(
        verbose_name="Список товаров", encoder=DjangoJSONEncoder
    )
    summary_price = models.DecimalField(
        max_digits=10, decimal_places=2, verbose_name="Общая стоимость"
    )
    comment = models.TextField(verbose_name="Комментарий", blank=True)
    is_approve = models.BooleanField(verbose_name="Проверен", default=False)  # Исправлено
    is_paid = models.BooleanField(verbose_name="Оплачено", default=False)  # Добавлено

    class Meta:
        verbose_name = "Заказ"
        verbose_name_plural = "Заказы"
        ordering = ["-order_date", "-is_approve"]  # Исправлено

    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Пользователь",
        related_name="orders",
    )

    def __str__(self):
        return f"Заказ #{self.id} - {self.full_name}"


class CustomOrder(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Пользователь",
        related_name="custom_orders",
    )
    full_name = models.CharField(max_length=300, verbose_name="ФИО")
    phone = models.CharField(max_length=20, verbose_name="Телефон")
    mail = models.EmailField(verbose_name="Email")
    order_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата заказа")
    comment = models.TextField(verbose_name="Комментарий", blank=True)
    is_approve = models.BooleanField(verbose_name="Проверен", default=False)  # Исправлено
    is_paid = models.BooleanField(verbose_name="Оплачено", default=False)  # Добавлено

    class Meta:
        verbose_name = "Индивидуальный заказ"
        verbose_name_plural = "Индивидуальные заказы"
        ordering = ["-order_date"]

    def __str__(self):
        return f"Индивидуальный заказ #{self.id} - {self.full_name}"


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="profile",
        verbose_name="Пользователь",
    )
    patronymic = models.CharField(
        max_length=150,
        blank=True,
        verbose_name="Отчество",
    )
    phone = models.CharField(
        max_length=20,
        blank=True,
        verbose_name="Телефон",
    )
    address = models.TextField(blank=True, verbose_name="Адрес")
    city = models.CharField(max_length=100, blank=True, verbose_name="Город")
    postal_code = models.CharField(max_length=20, blank=True, verbose_name="Почтовый индекс")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата создания")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Профиль пользователя"
        verbose_name_plural = "Профили пользователей"

    def __str__(self):
        return f"Профиль {self.user.get_full_name() or self.user.username}"


class CartItem(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="cart_items",
        verbose_name="Пользователь",
    )
    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
        verbose_name="Товар",
    )
    quantity = models.PositiveIntegerField(default=1, verbose_name="Количество")
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        verbose_name="Цена на момент добавления",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Добавлен")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Обновлён")

    class Meta:
        verbose_name = "Элемент корзины"
        verbose_name_plural = "Элементы корзин"
        unique_together = ("user", "product")

    def __str__(self):
        return f"{self.product.name} x {self.quantity} ({self.user or 'Гость'})"


from django.db.models.signals import post_save
from django.dispatch import receiver


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)


class OverwriteStorage(default_storage.__class__):

    def get_available_name(self, name, max_length=None):
        return name

    def _save(self, name, content):
        if self.exists(name):
            self.delete(name)
        return super()._save(name, content)


class PublicMedia(models.Model):
    file = models.FileField(upload_to="", storage=OverwriteStorage, verbose_name="Файл")
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата загрузки")

    target_dir = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Папка для сохранения",
    )

    class Meta:
        verbose_name = "Медиафайл"
        verbose_name_plural = "Медиафайлы"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._original_file_name = self.file.name if self.file else None
        self._original_file = None
        self._original_target_dir = self.target_dir
        if self.file:
            self._original_file = self.file.read()
            self.file.seek(0)

    def save(self, *args, **kwargs):
        # Если файл был изменен (или это новая запись)
        if self.file and (
            not self.pk
            or (
                hasattr(self, "_original_file_name")
                and self.file.name != self._original_file_name
            )
        ):
            new_file_content = self.file.read()
            self.file.seek(0)

            # Определяем путь сохранения
            filename = os.path.basename(self.file.name)

            # Если указан target_dir, сохраняем в него
            if self.target_dir:
                new_path = os.path.join(self.target_dir.strip("/"), filename)
            else:
                new_path = filename

            # Сохраняем файл по новому пути
            default_storage.save(new_path, ContentFile(new_file_content))

            # Обновляем путь в модели
            self.file.name = new_path

            # Удаляем временный файл (если он отличается)
            if self.file.name != new_path and default_storage.exists(self.file.name):
                default_storage.delete(self.file.name)

            # Удаляем старый файл (если это обновление и изменилась папка)
            if (
                self.pk
                and self._original_file_name
                and default_storage.exists(self._original_file_name)
                and self.target_dir != self._original_target_dir
            ):
                default_storage.delete(self._original_file_name)

        super().save(*args, **kwargs)
        self._original_file_name = self.file.name if self.file else None
        self._original_target_dir = self.target_dir

    def delete(self, *args, **kwargs):
        if self.file and default_storage.exists(self.file.name):
            default_storage.delete(self.file.name)
        super().delete(*args, **kwargs)

    @property
    def original_path(self):
        return self.file.name if self.file else ""

    @property
    def file_type(self):
        if not self.file:
            return ""
        return os.path.splitext(self.file.name)[1][1:].lower()

    @property
    def file_size(self):
        if self.file and default_storage.exists(self.file.name):
            return default_storage.size(self.file.name)
        return 0

    def get_readable_size(self):
        size = self.file_size
        for unit in ["B", "KB", "MB", "GB"]:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"

    def __str__(self):
        return self.original_path


class TelegramUser(models.Model):
    user_id = models.BigIntegerField(unique=True, verbose_name="ID пользователя")
    username = models.CharField(max_length=255, null=True, blank=True, verbose_name="Имя пользователя")
    first_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Имя")
    last_name = models.CharField(max_length=255, null=True, blank=True, verbose_name="Фамилия")
    notifications_enabled = models.BooleanField(default=True, verbose_name="Уведомления включены")
    is_approved = models.BooleanField(default=False, verbose_name="Подтвержден доступ")  # Добавьте это поле
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата регистрации")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Дата обновления")

    class Meta:
        verbose_name = "Пользователь Telegram"
        verbose_name_plural = "Пользователи Telegram"

    def __str__(self):
        return f"{self.username or self.first_name} ({self.user_id})"