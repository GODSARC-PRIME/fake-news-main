# Testing Setup Files - Index & Guide

## 📖 Files Created for Testing

### 🚀 **START HERE**

1. **[QUICK_START.md](QUICK_START.md)** ⭐ START HERE
   - Fastest way to get running (5-15 minutes)
   - Choose between: Automated script, Manual setup, or Docker
   - Platform access points and credentials
   - Quick verification steps

### 📋 **Setup & Configuration**

2. **[TESTING_SETUP.md](TESTING_SETUP.md)**
   - Detailed step-by-step setup guide
   - Backend setup with virtual environment
   - Frontend setup with npm
   - Comprehensive API endpoint documentation
   - cURL examples for API testing
   - Troubleshooting guide

3. **backend/requirements.txt**
   - All Python dependencies listed
   - Pinned versions for reproducibility
   - Includes: Django, DRF, Celery, Redis, etc.

4. **backend/.env**
   - Local testing environment variables
   - Django settings, database path, CORS config
   - Celery/Redis settings
   - Media file paths

5. **frontend/.env**
   - Frontend environment configuration
   - API base URL for local testing
   - App name and version
   - Feature flags

### 🧪 **Testing Resources**

6. **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)**
   - 100+ test cases to verify functionality
   - Organized by component: Backend, Frontend, Integration
   - Test categories:
     - Server startup & database
     - API connectivity & endpoints
     - Authentication
     - Form validation
     - Error handling
     - Performance
     - Security basics
     - UI/UX
   - Includes bug tracking section
   - Sign-off for test completion

7. **[API_TESTING.md](API_TESTING.md)**
   - cURL command examples for all endpoints
   - Organized by feature area
   - Both bash and PowerShell versions
   - Includes expected responses
   - Test data examples

8. **Postman_Collection.json**
   - Import into Postman for easy API testing
   - Pre-configured requests for all endpoints
   - Uses variables for BASE_URL and TOKEN
   - Just login once to populate token
   - Click through organized endpoint groups

### 🤖 **Automated Setup**

9. **setup.bat** (Windows)
   - Run: `.\setup.bat`
   - Automatically:
     - Creates Python venv
     - Installs dependencies
     - Runs migrations
     - Creates admin user
     - Installs npm packages

10. **setup.sh** (Linux/macOS)
    - Run: `chmod +x setup.sh && ./setup.sh`
    - Same automation as setup.bat

11. **backend/create_admin.py**
    - Django shell script to create admin user
    - Used by setup scripts
    - Can be run manually: `python manage.py shell < create_admin.py`

### 🐳 **Docker Setup (Optional)**

12. **docker-compose.yml**
    - One-command setup for entire stack
    - Includes: PostgreSQL, Redis, Backend, Frontend, Celery
    - No local Python/Node.js installation needed
    - Run: `docker-compose up -d`

13. **backend/Dockerfile**
    - Containerized Django backend
    - Includes Python 3.12, system dependencies
    - Auto-runs migrations on startup

14. **frontend/Dockerfile**
    - Containerized React frontend
    - Node 20 Alpine image
    - Auto-runs dev server on port 5173

---

## 📊 File Usage Flow

### For Quick Start (< 20 minutes)
```
1. Read: QUICK_START.md
2. Choose setup method (automated, manual, or Docker)
3. Follow 5 verification steps
4. Access platform at provided URLs
```

### For Comprehensive Testing (1-2 hours)
```
1. Read: QUICK_START.md (setup)
2. Read: TESTING_CHECKLIST.md (what to test)
3. Use: Postman_Collection.json (API testing)
4. Read: API_TESTING.md (cURL examples if needed)
5. Track results in TESTING_CHECKLIST.md
```

### For API-Only Testing
```
1. Ensure backend is running
2. Use one of:
   - API_TESTING.md (cURL commands)
   - Postman_Collection.json (import into Postman)
3. Get token from login endpoint
4. Test other endpoints
```

### For Docker Deployment
```
1. Ensure Docker & Docker Compose installed
2. Run: docker-compose up -d
3. Verify with browser at localhost:5173
4. Create admin: docker-compose exec backend python manage.py shell < create_admin.py
```

---

## 🎯 Which File to Use?

| Task | File to Use |
|------|-----------|
| Get running fast | **QUICK_START.md** |
| Full setup guide | **TESTING_SETUP.md** |
| What to test | **TESTING_CHECKLIST.md** |
| API with cURL | **API_TESTING.md** |
| API with GUI | **Postman_Collection.json** |
| Dependencies | **backend/requirements.txt** |
| Config settings | **backend/.env** & **frontend/.env** |
| Automated setup | **setup.bat** or **setup.sh** |
| No-install setup | **docker-compose.yml** |

---

## 🔍 Feature Testing Guide

### Test Text Validation
```
File: TESTING_CHECKLIST.md → Frontend Tests → Validation Page
Command: Submit "The Earth is flat" at http://localhost:5173/validate
API: Postman_Collection.json → Validation → Submit Text for Validation
```

### Test Admin Dashboard
```
File: TESTING_CHECKLIST.md → Protected Pages → Admin Dashboard
URL: http://localhost:5173/admin
Credentials: admin / admin123 (from QUICK_START.md)
```

### Test All API Endpoints
```
File 1: API_TESTING.md (copy/paste cURL commands)
File 2: Postman_Collection.json (import and click)
Credentials: Get from QUICK_START.md or API_TESTING.md
```

### Test Performance
```
File: TESTING_CHECKLIST.md → Performance Tests
Note: Basic timing checks, load testing requires tools
```

---

## 📱 Platform Access Points

After setup is complete (from QUICK_START.md):

| Component | URL | Purpose |
|-----------|-----|---------|
| Frontend | http://localhost:5173 | User interface |
| Validation | http://localhost:5173/validate | Submit content to check |
| Admin Dashboard | http://localhost:5173/admin | Statistics & management |
| Django Admin | http://localhost:8000/admin | Database management |
| API Docs | See API_TESTING.md | Endpoint documentation |

---

## ✅ Pre-Testing Checklist

Before running tests:
- [ ] Python 3.10+ installed (have 3.12.9 ✓)
- [ ] Node.js 18+ installed
- [ ] Read QUICK_START.md
- [ ] Ran setup (automated or manual)
- [ ] Backend running on localhost:8000
- [ ] Frontend running on localhost:5173
- [ ] Can access http://localhost:5173 in browser
- [ ] Have admin credentials (admin/admin123)

---

## 🆘 If Something Goes Wrong

1. **Backend won't start**
   - See QUICK_START.md → Troubleshooting
   - See TESTING_SETUP.md → Troubleshooting

2. **Frontend won't load**
   - See QUICK_START.md → Troubleshooting
   - Check npm install succeeded
   - Try different port: `npm run dev -- --port 5174`

3. **API endpoints not responding**
   - Check backend is running
   - Check authorization header has token
   - See API_TESTING.md for correct format

4. **Database errors**
   - See TESTING_SETUP.md → Backend Issues
   - Reset database: `rm db.sqlite3 && python manage.py migrate`

5. **Port conflicts**
   - See QUICK_START.md → Troubleshooting
   - Run on different port (8001, 5174, etc.)

---

## 📞 Quick Reference

### Common Commands

**Backend (Terminal 1):**
```bash
cd backend
venv\Scripts\activate              # Windows
source venv/bin/activate           # Linux/macOS
pip install -r requirements.txt    # Install deps
python manage.py migrate           # Setup database
python manage.py runserver         # Start server
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm install                        # Install deps
npm run dev                        # Start dev server
```

**Admin User:**
```bash
python manage.py shell < create_admin.py
# Username: admin
# Password: admin123
```

**Docker:**
```bash
docker-compose up -d              # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop all services
```

---

## 🎓 Learning Path

**For understanding the platform:**
1. Read: QUICK_START.md (overview)
2. Read: Initial project analysis
3. Run: Setup
4. Test: TESTING_CHECKLIST.md
5. Explore: Frontend at http://localhost:5173
6. Explore: Admin dashboard
7. Test: API endpoints with Postman or cURL

**For testing comprehensively:**
1. Print out TESTING_CHECKLIST.md
2. Go through each section methodically
3. Mark off items as you test
4. Record any bugs found
5. Note final sign-off

---

## 📚 Additional Resources

- **Code Analysis**: Refer to my initial code structure analysis
- **API Documentation**: See API_TESTING.md for all endpoints
- **Deployment**: See docker-compose.yml for production-like setup
- **Improvements**: After testing, areas for improvement will be obvious

---

## ✨ You're All Set!

You now have everything needed to:
- ✅ Set up the platform quickly
- ✅ Test all current capabilities
- ✅ Test via UI and API
- ✅ Track test results
- ✅ Identify issues
- ✅ Plan improvements

**Next step:** Open QUICK_START.md and follow the setup instructions!

---

*Created: May 1, 2026*
*Platform: Fake News Detection System*
*Status: Ready for Testing*
