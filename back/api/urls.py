from django.urls import path
from . import views

app_name = "api"

urlpatterns = [
    path("categories/", views.CategoryListAPIView.as_view(), name="categories-list"),
    path("products/", views.ProductListAPIView.as_view(), name="products-list"),
    path("orders/", views.OrdersListAPIView.as_view(), name="orders-list"),
    path("castom-order/", views.CustomOrderListAPIView.as_view(), name="castom-order"),
    path("cart/add/<int:product_id>/", views.CartAddView.as_view(), name="cart-add"),
    path(
        "cart/remove/<int:product_id>/",
        views.CartRemoveView.as_view(),
        name="cart-remove",
    ),
    path(
        "cart/update/<int:product_id>/",
        views.CartUpdateView.as_view(),
        name="cart-update",
    ),
    path("cart/clear/", views.CartClearView.as_view(), name="cart-clear"),
    path("cart/detail/", views.CartDetailView.as_view(), name="cart-detail"),
    path("orders/create/", views.CreateOrderView.as_view(), name="create-order"),
    path(
        "orders/create-custom/",
        views.CreateCustomOrderView.as_view(),
        name="create-custom-order",
    ),
    path("auth/me/", views.AuthMeView.as_view(), name="auth-me"),
    path("auth/register/", views.AuthRegisterView.as_view(), name="auth-register"),
    path("auth/login/", views.AuthLoginView.as_view(), name="auth-login"),
    path("auth/logout/", views.AuthLogoutView.as_view(), name="auth-logout"),
    path("products/<int:product_id>/", views.ProductDetailAPIView.as_view(), name="product-detail"),
    path('csrf/', views.CSRFTokenView.as_view(), name='csrf-token'),
]
