#!/bin/bash
# Quick start script for Linux/macOS
# This script sets up both backend and frontend for testing

echo ""
echo "========================================"
echo "Fake News Detection Platform - Setup"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    exit 1
fi

echo ""
echo "Step 1: Setting up Backend..."
echo ""
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser
echo ""
echo "Creating admin user..."
python manage.py shell <<EOF
from django.contrib.auth.models import User
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
    print("Admin user created successfully!")
else:
    print("Admin user already exists!")
EOF

echo ""
echo "Backend setup complete!"
echo ""

# Go back to root
cd ..

echo ""
echo "Step 2: Setting up Frontend..."
echo ""
cd frontend

# Install dependencies
echo "Installing npm dependencies..."
npm install

echo ""
echo "Frontend setup complete!"
echo ""
cd ..

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "To start the backend:"
echo "  1. Open terminal"
echo "  2. Navigate to: backend"
echo "  3. Run: source venv/bin/activate"
echo "  4. Run: python manage.py runserver"
echo ""
echo "To start the frontend:"
echo "  1. Open another terminal"
echo "  2. Navigate to: frontend"
echo "  3. Run: npm run dev"
echo ""
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Admin Credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
