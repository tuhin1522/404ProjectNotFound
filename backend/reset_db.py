import os
import django
from django.conf import settings
from django.db import connection

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

with connection.cursor() as cursor:
    cursor.execute('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')

print("Database wiped successfully!")
