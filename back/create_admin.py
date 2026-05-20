import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from django.contrib.auth.models import User

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@mail.com', 'admin')
    print("✅ Суперпользователь 'admin' создан")
else:
    print("ℹ️  Суперпользователь 'admin' уже существует")
