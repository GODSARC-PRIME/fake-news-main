# Testing Setup Guide for Fake News Detection Platform

## Quick Start

This guide will help you set up and test the current capabilities of the fake news detection platform.

---

## Backend Setup

### Prerequisites
- Python 3.10+ (you have 3.12.9 ✓)
- pip package manager

### Step 1: Create Virtual Environment

```powershell
cd backend
python -m venv venv
venv\Scripts\activate
```

### Step 2: Install Dependencies

```powershell
pip install -r requirements.txt
```

### Step 3: Setup Database

```powershell
python manage.py migrate
```

### Step 4: Create Admin User (Bootstrap)

```powershell
# Option A: Use the bootstrap endpoint (after starting server)
# POST http://localhost:8000/api/bootstrap-admin/
# Body: {"username": "admin", "password": "admin123"}

# Option B: Create via Django shell
python manage.py shell
```

Then in the Django shell:
```python
from django.contrib.auth.models import User
User.objects.create_superuser('admin', 'admin@test.com', 'admin123')
exit()
```

### Step 5: Start Backend Server

```powershell
python manage.py runserver
```

Backend will be available at: `http://localhost:8000`

---

## Frontend Setup

### Prerequisites
- Node.js 18+ and npm

### Step 1: Install Dependencies

```powershell
cd frontend
npm install
```

### Step 2: Start Development Server

```powershell
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## Testing Current Capabilities

### 1. Home Page
- **URL:** `http://localhost:5173/`
- **What to test:**
  - Page loads correctly
  - Navigation is visible
  - Basic layout is responsive

### 2. Login
- **URL:** `http://localhost:5173/login`
- **Credentials:**
  - Username: `admin`
  - Password: `admin123`
- **What to test:**
  - Login form validation
  - Error handling for wrong credentials
  - Successful login redirect

### 3. Validation Page (Main Feature)
- **URL:** `http://localhost:5173/validate`
- **What to test:**
  - Submit text for fact-checking
  - Submit URL for verification
  - Language detection
  - Submission tracking

**Test Inputs:**
```
Text examples:
- "The Earth is flat" (obviously false claim)
- "Water boils at 100 degrees Celsius" (true claim)
- Any news headline or claim you want to verify

URL examples:
- Any news article URL
- Blog post URL
```

### 4. Results Page
- **URL:** `http://localhost:5173/result/{submission_id}`
- **What to test:**
  - View analysis results
  - Check suspicious words detection
  - View processing status
  - Check timestamps

### 5. Admin Dashboard
- **URL:** `http://localhost:5173/admin`
- **Requirements:** Must be logged in as admin
- **What to test:**
  - View dashboard overview
  - Check statistics (total submissions, average processing time)
  - Navigate between admin tabs

### 6. Admin Stats
- **URL:** `http://localhost:5173/admin/stats`
- **What to test:**
  - View detailed statistics
  - Check submission trends
  - View language distribution
  - Check system performance metrics

### 7. Admin Submissions
- **URL:** `http://localhost:5173/admin/submissions`
- **What to test:**
  - View list of all submissions
  - Filter/search submissions
  - View submission details
  - Delete submissions

---

## API Endpoints to Test (Using Postman or cURL)

### Authentication
```
POST /api/auth/login/
POST /api/auth/logout/
GET /api/auth/profile/
GET /api/auth/check-admin/
POST /api/auth/create-admin/
```

### Validation
```
POST /api/validate/
  - Form data:
    - text (optional)
    - url (optional)
    - audio (optional file)
    - video (optional file)
    - language (optional)

GET /api/result/<submission_id>/
  - Returns: Processing status, results, suspicious words

GET /api/recent/
  - Returns: List of recent submissions
```

### Admin
```
GET /api/admin/stats/
  - Returns: Aggregated statistics

GET /api/admin/submissions/
  - Returns: List of all submissions with filtering

GET /api/admin/trends/
  - Returns: Trend data over time

GET /api/admin/activity/
  - Returns: Recent activity log

GET /api/admin/suspicious-words/
  - Returns: Suspicious words statistics

GET /api/admin/system-usage/
  - Returns: System performance metrics

DELETE /api/admin/submissions/<submission_id>/
  - Deletes a submission
```

---

## cURL Testing Examples

### Test Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test Validation (Text)
```bash
curl -X POST http://localhost:8000/api/validate/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -F "text=The earth is flat" \
  -F "language=en"
```

### Get Results
```bash
curl http://localhost:8000/api/result/{submission_id}/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

### Get Admin Stats
```bash
curl http://localhost:8000/api/admin/stats/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"
```

---

## Testing Checklist

### Backend Tests
- [ ] Django migrations run successfully
- [ ] Admin user created
- [ ] Server starts without errors
- [ ] API endpoints respond
- [ ] CORS is properly configured
- [ ] Token authentication works

### Frontend Tests
- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Form submissions work
- [ ] API calls are successful
- [ ] Auth context is working
- [ ] Protected routes require login

### Integration Tests
- [ ] Can login from frontend
- [ ] Can submit validation requests
- [ ] Can view results
- [ ] Admin dashboard shows correct data
- [ ] Admin can view submissions
- [ ] Admin can delete submissions

---

## Troubleshooting

### Backend Issues

**Django migrations fail:**
```powershell
python manage.py migrate --run-syncdb
```

**Port 8000 already in use:**
```powershell
python manage.py runserver 8001
# Update VITE_API_BASE_URL to http://localhost:8001/api
```

**Database is corrupted:**
```powershell
rm db.sqlite3
python manage.py migrate
```

### Frontend Issues

**Port 5173 already in use:**
```powershell
npm run dev -- --port 5174
```

**Dependencies not installing:**
```powershell
rm -r node_modules package-lock.json
npm install
```

---

## Next Steps After Testing

1. Test API rate limiting
2. Test error handling edge cases
3. Test multi-language support
4. Test audio/video processing (requires FFmpeg)
5. Test with Celery for async task processing
6. Load testing with multiple concurrent submissions
7. Security testing (SQL injection, XSS, CSRF)

---

## Notes

- The `.env` file in this repo is for **LOCAL TESTING ONLY**
- Change `DJANGO_SECRET_KEY` before deploying to production
- Enable `DJANGO_DEBUG=False` in production
- Configure proper database (PostgreSQL recommended for production)
- Set up Celery with Redis for production task processing
- Enable HTTPS in production
- Set proper `CORS_ALLOWED_ORIGINS` for production domains
