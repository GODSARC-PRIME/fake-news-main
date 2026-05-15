"""
Django shell script to create admin user
Usage: python manage.py shell < create_admin.py
"""

from django.contrib.auth.models import User

# Check if admin user already exists
if User.objects.filter(username='admin').exists():
    print("✓ Admin user already exists!")
else:
    # Create superuser
    User.objects.create_superuser(
        username='admin',
        email='admin@test.com',
        password='admin123'
    )
    print("✓ Admin user created successfully!")
    print("  Username: admin")
    print("  Password: admin123")
    print("  Email: admin@test.com")
