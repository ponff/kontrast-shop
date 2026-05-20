#!/usr/bin/env python
"""
Скрипт для загрузки начальных данных в базу данных.

Использование:
  python load_data.py              # Загрузить данные (если их еще нет)
  python load_data.py --clear      # Очистить и перезагрузить данные
"""

import os
import django

# Настройка Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'back.settings')
django.setup()

from django.core.management import call_command
import sys

if __name__ == '__main__':
    args = sys.argv[1:]
    call_command('load_initial_data', *args)
