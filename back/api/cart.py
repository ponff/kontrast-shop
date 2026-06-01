from decimal import Decimal
from django.conf import settings
from django.contrib.auth import get_user_model
from api.models import CartItem, Product


User = get_user_model()


class Cart:
    def __init__(self, request):
        self.request = request
        self.user = request.user if request.user.is_authenticated else None
        self.session = request.session

        if not self.user:
            cart = self.session.get(settings.CART_SESSION_ID)
            if not cart:
                cart = self.session[settings.CART_SESSION_ID] = {}
            self.cart = cart

    def add(self, product, quantity=1, color=None):
        # Поддерживаем опцию выбора цвета (color)
        if color is None and hasattr(self, 'request') and self.request is not None:
            color = self.request.data.get('color') if hasattr(self.request, 'data') else None

        if self.user:
            cart_item, created = CartItem.objects.get_or_create(
                user=self.user,
                product=product,
                color=color,
                defaults={
                    "quantity": quantity,
                    "price": Decimal(str(product.price)),
                },
            )
            if not created:
                cart_item.quantity += quantity
                cart_item.price = Decimal(str(product.price))
            cart_item.save()
            return cart_item

        # Для сессии используем ключ product_id:color чтобы различать варианты
        key = f"{product.id}:{color or ''}"
        if key not in self.cart:
            self.cart[key] = {
                "quantity": quantity,
                "price": float(product.price),
                "product_name": product.name,
                "product_id": product.id,
                "self_price": float(product.self_price),
                "color": color,
            }
        else:
            self.cart[key]["quantity"] += quantity
        self.save()

    def save(self):
        self.session.modified = True

    def remove(self, product, color=None):
        if color is None and hasattr(self, 'request') and self.request is not None:
            color = self.request.data.get('color') if hasattr(self.request, 'data') else None

        if self.user:
            if color:
                CartItem.objects.filter(user=self.user, product=product, color=color).delete()
            else:
                CartItem.objects.filter(user=self.user, product=product).delete()
            return

        # сессия: ключи вида 'product_id:color'
        if color is not None:
            key = f"{product.id}:{color or ''}"
            if key in self.cart:
                del self.cart[key]
                self.save()
            return

        keys_to_remove = [k for k in list(self.cart.keys()) if k.split(':')[0] == str(product.id)]
        for k in keys_to_remove:
            del self.cart[k]
        self.save()

    def update(self, product, quantity, color=None):
        if color is None and hasattr(self, 'request') and self.request is not None:
            color = self.request.data.get('color') if hasattr(self.request, 'data') else None

        if self.user:
            cart_item = CartItem.objects.filter(user=self.user, product=product, color=color).first()
            if not cart_item:
                return None
            if quantity <= 0:
                cart_item.delete()
                return None
            cart_item.quantity = quantity
            cart_item.price = Decimal(str(product.price))
            cart_item.save()
            return cart_item

        # сессия: используем ключ product_id:color
        if color is None and hasattr(self, 'request') and self.request is not None:
            color = self.request.data.get('color') if hasattr(self.request, 'data') else None
        key = f"{product.id}:{color or ''}"
        if key in self.cart:
            if quantity <= 0:
                self.remove(product)
                return None

            self.cart[key]["quantity"] = quantity
            self.cart[key]["total_price"] = product.price * quantity
            self.save()

        return self.cart.get(key)

    def clear(self):
        if self.user:
            CartItem.objects.filter(user=self.user).delete()
            return
        if settings.CART_SESSION_ID in self.session:
            del self.session[settings.CART_SESSION_ID]
            self.save()

    def get_total_price(self):
        if self.user:
            return sum(
                item.price * item.quantity
                for item in CartItem.objects.filter(user=self.user).select_related('product')
            )

        return sum(
            Decimal(str(item["price"])) * item["quantity"]
            for item in self.cart.values()
        )

    def __len__(self):
        if self.user:
            return sum(
                item.quantity
                for item in CartItem.objects.filter(user=self.user)
            )
        return sum(item["quantity"] for item in self.cart.values())

    def get_items(self):
        if self.user:
            for cart_item in CartItem.objects.filter(user=self.user).select_related('product'):
                yield {
                    "product_id": cart_item.product.id,
                    "product_name": cart_item.product.name,
                    "quantity": cart_item.quantity,
                    "price": cart_item.price,
                    "total_price": cart_item.price * cart_item.quantity,
                    "product": cart_item.product,
                    "self_price": float(cart_item.product.self_price),
                    "color": cart_item.color,
                }

            return

        # В сессии ключи вида 'product_id:color'
        cart = self.cart.copy()
        product_ids = list({k.split(':')[0] for k in cart.keys()})
        products = Product.objects.filter(id__in=product_ids)

        for product in products:
            for key, item in cart.items():
                pid, _sep, col = key.partition(':')
                if str(product.id) == pid:
                    item["product"] = product

        for item in cart.values():
            item["price"] = Decimal(str(item["price"]))
            item["total_price"] = item["price"] * item["quantity"]
            yield item

    def get_orders_list(self):
        orders_list = []
        for item in self.get_items():
            orders_list.append(
                {
                    "product_id": item["product_id"],
                    "product_name": item["product_name"],
                    "quantity": item["quantity"],
                    "self_price": float(item["self_price"]),
                    "price": float(item["price"]),
                    "total_price": float(item["total_price"]),
                    "color": item.get("color"),
                }
            )
        return orders_list

    def transfer_session_cart_to_user(self):
        if not self.user:
            return

        session_cart = self.session.get(settings.CART_SESSION_ID, {})
        for product_id, item in session_cart.items():
            # ключ product_id может быть 'id:color'
            pid, _sep, col = product_id.partition(':')
            try:
                product = Product.objects.get(id=pid)
            except Product.DoesNotExist:
                continue
            # передаем цвет в запрос-поля временно
            # В методе add он будет прочитан из self.request.data, поэтому передадим color через параметр
            self.add(product, item.get("quantity", 0))

        if settings.CART_SESSION_ID in self.session:
            del self.session[settings.CART_SESSION_ID]
            self.save()

    def __iter__(self):
        for item in self.get_items():
            yield item
