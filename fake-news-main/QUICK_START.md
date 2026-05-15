# Fake News Detection Platform - Quick Start Guide

## 📋 What's Included

This setup includes everything you need to test the platform's current capabilities:

✅ **Backend Setup Files:**
- `requirements.txt` - All Python dependencies
- `.env` - Environment configuration for local testing
- `create_admin.py` - Script to create admin user
- `Dockerfile` - Docker setup (optional)

✅ **Frontend Setup Files:**
- `.env` - Frontend environment configuration
- `Dockerfile` - Docker setup (optional)

✅ **Testing Resources:**
- `TESTING_SETUP.md` - Detailed setup instructions
- `TESTING_CHECKLIST.md` - Comprehensive testing checklist
- `API_TESTING.md` - API testing commands
- `Postman_Collection.json` - Postman API collection
- `setup.bat` - Automated setup for Windows
- `setup.sh` - Automated setup for Linux/macOS
- `docker-compose.yml` - Docker Compose for full stack

---

## 🚀 Quickest Start (Windows)

### Option 1: Using Automated Script
```powershell
# Run from project root
.\setup.bat
```

This will:
1. Create Python virtual environment
2. Install all dependencies
3. Run database migrations
4. Create admin user
5. Install npm packages

### Option 2: Manual Setup (15 minutes)

**Terminal 1 - Backend:**
```powershell
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py shell < create_admin.py
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm install
npm run dev
```

---

## 🚀 Quickest Start (Linux/macOS)

### Option 1: Using Automated Script
```bash
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py shell < create_admin.py
python manage.py runserver
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Setup (All Platforms)

```bash
# Build and start all services
docker-compose up -d

# Verify services
docker-compose ps

# Create admin user
docker-compose exec backend python manage.py shell < create_admin.py

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

Services will be available at:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173
- Database: localhost:5432
- Redis: localhost:6379

---

## 📍 Access Points

Once everything is running:

| Component | URL | Credentials |
|-----------|-----|-------------|
| **Frontend Home** | http://localhost:5173 | - |
| **Validation Page** | http://localhost:5173/validate | - |
| **Admin Dashboard** | http://localhost:5173/admin | admin/admin123 |
| **Django Admin** | http://localhost:8000/admin | admin/admin123 |
| **API Root** | http://localhost:8000/api | - |

---

## ✅ Quick Verification

Once started, verify everything works:

### Backend Health Check
```bash
# Should return "Backend is live!"
curl http://localhost:8000

# Should return API endpoints
curl http://localhost:8000/api

# Should return stats (after login)
curl http://localhost:8000/api/auth/login/ \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Frontend Health Check
- Open http://localhost:5173 in browser
- Should load home page
- Click "Validate" → should navigate to validation page

---

## 🧪 Test the Features

### 1. Text Validation
1. Go to http://localhost:5173/validate
2. Enter text: "The Earth is flat"
3. Click "Validate"
4. Check results at provided link

### 2. Admin Dashboard
1. Go to http://localhost:5173/login
2. Login with admin/admin123
3. Click admin button to go to dashboard
4. Check statistics and submissions

### 3. API Testing
Use the included `Postman_Collection.json`:
1. Open Postman
2. Import `Postman_Collection.json`
3. Set `BASE_URL` variable to `http://localhost:8000`
4. Login to get `TOKEN`
5. Test various endpoints

Or use cURL (see `API_TESTING.md` for examples)

---

## 📝 Test Coverage

Complete testing checklist available in `TESTING_CHECKLIST.md` covering:
- Backend API endpoints
- Frontend pages and components
- Authentication and authorization
- Form validation
- Error handling
- Performance
- Security basics
- User workflows

---

## 🐛 Troubleshooting

### Port Already in Use
```powershell
# Backend on different port
python manage.py runserver 8001

# Frontend on different port
npm run dev -- --port 5174
```

### Python Virtual Environment Issues
```powershell
# Remove and recreate
Remove-Item -Path venv -Recurse -Force
python -m venv venv
venv\Scripts\activate
```

### Database Corrupted
```powershell
# Reset database
Remove-Item -Path db.sqlite3
python manage.py migrate
python manage.py shell < create_admin.py
```

### Dependencies Not Installing
```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Then reinstall
pip install -r requirements.txt
```

### Frontend Build Errors
```powershell
cd frontend
Remove-Item -Path node_modules -Recurse -Force
npm cache clean --force
npm install
```

---

## 📚 Documentation

- **Full Setup Guide:** See `TESTING_SETUP.md`
- **API Endpoints:** See `API_TESTING.md`
- **Testing Guide:** See `TESTING_CHECKLIST.md`
- **Code Analysis:** See my previous analysis

---

## 🎯 What to Test First

1. **Backend Startup** (5 min)
   - Verify Django server runs
   - Check API responds
   
2. **Frontend Startup** (5 min)
   - Verify React app loads
   - Check pages render
   
3. **Login Flow** (5 min)
   - Test login page
   - Test admin credentials work
   
4. **Text Validation** (10 min)
   - Submit text
   - Check results
   - Verify suspicious words detected
   
5. **Admin Dashboard** (10 min)
   - View statistics
   - View submissions
   - Delete a submission

---

## 🔑 Admin Credentials

```
Username: admin
Password: admin123
Email: admin@test.com
```

---

## ⚠️ Important Notes

- The `.env` file with `DJANGO_SECRET_KEY` is for **LOCAL TESTING ONLY**
- Change all secrets before deploying to production
- SQLite is used for development - use PostgreSQL in production
- Celery requires Redis - optional for basic testing
- FFmpeg required for audio/video processing - optional for text testing

---

## 📞 Next Steps

After testing current capabilities:
1. Review `TESTING_CHECKLIST.md` for comprehensive tests
2. Check `TESTING_SETUP.md` for advanced configurations
3. Review the codebase for improvements
4. Plan optimizations and new features
5. Set up CI/CD pipeline

---

**Happy Testing!** 🎉

For issues or questions, refer to the detailed documentation files in the project root.
