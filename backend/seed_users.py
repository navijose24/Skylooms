import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from core.models import UserProfile

def seed_users():
    # Create regular user
    if not User.objects.filter(username='testuser').exists():
        user = User.objects.create_user(username='testuser', email='testuser@example.com', password='password123')
        print("Created testuser")
    else:
        print("testuser already exists")

    # Create admin user
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(username='admin', email='admin@example.com', password='admin123')
        # Standard superuser might not have the 'admin' role in UserProfile depending on signals
        # The signal create_user_profile handles creation. Let's ensure role is 'admin'
        admin.profile.role = 'admin'
        admin.profile.save()
        print("Created admin user")
    else:
        # Ensure existing admin has admin role
        admin = User.objects.get(username='admin')
        admin.profile.role = 'admin'
        admin.profile.save()
        print("Admin user already exists, updated role")

if __name__ == '__main__':
    seed_users()
