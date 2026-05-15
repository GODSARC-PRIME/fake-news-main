# 🚀 CheckDem Deployment Guide

Complete guide to deploy CheckDem (fake news detector) to production.

---

## **QUICK START: Railway.app (Recommended)**

### **1. Prepare Your Repository**

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### **2. Deploy on Railway**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Connect your GitHub account
4. Select your `fake-news-main` repository
5. Railway auto-detects Python/Node.js projects

### **3. Add PostgreSQL Database**

1. In Railway dashboard, click "+" → Add PostgreSQL
2. Railway auto-creates `DATABASE_URL` env var

### **4. Add Redis**

1. Click "+" → Add Redis
2. Railway auto-creates `REDIS_URL` env var

### **5. Configure Environment Variables**

In Railway → Variables, add:

```
DJANGO_DEBUG=False
DJANGO_SECRET_KEY=<generate-strong-key>
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=<secure-password>
```

Generate a strong Django secret key:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

### **6. Deploy Backend**

Railway auto-deploys when you push to GitHub:
```bash
git push origin main
```

Backend runs migrations automatically on deploy.

### **7. Deploy Frontend**

Option A: Deploy on Vercel (simplest)
- Go to [vercel.com](https://vercel.com)
- Connect GitHub → Select repository
- Add environment variable: `VITE_API_URL=https://your-backend-url.railway.app`
- Deploy

Option B: Deploy frontend on Railway too
- Create separate Railway service for frontend
- Set build command: `npm run build`
- Set start command: `npm run preview`

---

## **DETAILED SETUP BY PLATFORM**

### **RAILWAY.APP (Most Beginner-Friendly)**

#### **Pros:**
- One-click GitHub deployment
- Auto-manages environment variables
- Integrated PostgreSQL & Redis
- Free tier available ($5/month starter)
- Great for hobby projects

#### **Steps:**
1. Sign up at railway.app
2. Create new project from GitHub
3. Add services: PostgreSQL, Redis
4. Set environment variables
5. Trigger deployment

**Frontend on Vercel:**
- Deploy React to Vercel for free
- Update API URL in environment variables

---

### **RENDER.COM (Also Beginner-Friendly)**

#### **Steps:**
1. Go to [render.com](https://render.com)
2. Create new Web Service from GitHub
3. Runtime: Python 3.12
4. Build command: `pip install -r backend/requirements.txt && cd backend && python manage.py migrate`
5. Start command: `cd backend && gunicorn checkdem_backend.wsgi`
6. Add PostgreSQL database from Render dashboard
7. Add Redis from Render dashboard

#### **Pricing:** $12/month and up

---

### **HEROKU (Classic, Now Paid)**

#### **Steps:**
```bash
# Install Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

heroku login
heroku create your-app-name
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:premium-0
heroku config:set DJANGO_DEBUG=False
heroku config:set DJANGO_SECRET_KEY=<your-key>
git push heroku main
```

#### **Pricing:** $7-25/month and up

---

### **AWS (CHEAPEST for Scale, But Complex)**

#### **Options:**
- **EC2 + RDS + ElastiCache**: ~$15-30/month
- **Elastic Beanstalk**: Auto-scales
- **AppRunner**: Simpler than Beanstalk

#### **Steps (Elastic Beanstalk):**
```bash
pip install awseb-cli-3
eb init -p "Python 3.12" fake-news-detector
eb create checkdem-prod
eb deploy
```

---

## **DATABASE MIGRATION**

Your app uses SQLite locally. Production needs PostgreSQL:

### **The Migration is Automatic!**

Django's migration system handles it automatically:

1. Set `DATABASE_URL` to PostgreSQL connection string
2. On first deploy, Railway/Render runs:
   ```bash
   python manage.py migrate
   ```
3. All tables created in PostgreSQL
4. Your data schema transfers automatically

---

## **PRODUCTION CHECKLIST**

- [ ] Generate strong `DJANGO_SECRET_KEY`
- [ ] Set `DJANGO_DEBUG=False`
- [ ] Configure `DJANGO_ALLOWED_HOSTS` with your domain
- [ ] Set up PostgreSQL database
- [ ] Set up Redis for Celery
- [ ] Create admin user via environment variables
- [ ] Enable HTTPS/SSL (automatic on most platforms)
- [ ] Add your frontend URL to `CORS_ALLOWED_ORIGINS`
- [ ] Test login/submission/results workflow
- [ ] Monitor logs and errors

---

## **ENVIRONMENT VARIABLES REFERENCE**

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `DJANGO_DEBUG` | Yes | `False` | Must be False in production |
| `DJANGO_SECRET_KEY` | Yes | `xyz123...` | Generate with: `python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_ALLOWED_HOSTS` | Yes | `yourdomain.com` | Comma-separated hostnames |
| `DATABASE_URL` | Yes (auto) | `postgresql://...` | Auto-set by Railway/Render |
| `CELERY_BROKER_URL` | Yes (auto) | `redis://...` | Auto-set by Railway/Render |
| `ADMIN_USERNAME` | Yes | `admin` | Created on first deploy |
| `ADMIN_EMAIL` | Yes | `admin@example.com` | |
| `ADMIN_PASSWORD` | Yes | `secure_password` | Change after first login |
| `CHECKDEM_MISTRAL_API_KEY` | No | `your_key` | Optional, for AI enhancement |

---

## **TROUBLESHOOTING**

### **"ImportError: No module named 'django'"**
- Solution: Platform didn't run `pip install -r requirements.txt`
- Check: Ensure `requirements.txt` is in root or `backend/`

### **"ALLOWED_HOSTS error"**
- Solution: Add your domain to `DJANGO_ALLOWED_HOSTS` env var
- Example: `yourdomain.com,www.yourdomain.com`

### **"Celery worker not running"**
- Solution: Ensure Redis is provisioned and `CELERY_BROKER_URL` is set
- Check: `rails logs` or platform logs for Celery errors

### **"PostgreSQL connection refused"**
- Solution: Ensure DATABASE_URL is set correctly
- Check: `db_url` vs `DATABASE_URL` capitalization

### **Frontend API calls failing**
- Solution: Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py
- Example: `https://yourdomain-frontend.vercel.app`

---

## **MANUAL DEPLOYMENT EXAMPLE (VPS)**

If using DigitalOcean, Linode, or AWS EC2:

```bash
# SSH into server
ssh root@your_server_ip

# Clone repository
git clone https://github.com/your-username/fake-news-main.git
cd fake-news-main

# Create Python venv
python3.12 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt
cd backend

# Configure .env
nano .env
# Add all production variables

# Collect static files
python manage.py collectstatic --noinput

# Run migrations
python manage.py migrate

# Start with Gunicorn
gunicorn checkdem_backend.wsgi --bind 0.0.0.0:8000

# In another terminal, start Celery worker
celery -A checkdem_backend worker -l info

# Use Nginx as reverse proxy
# Configure Nginx to forward requests to http://127.0.0.1:8000
```

---

## **NEXT STEPS AFTER DEPLOYMENT**

1. **Monitor Logs**: Check platform dashboard for errors
2. **Test Workflows**: 
   - Homepage loads
   - Submit text/URL
   - Check results page
   - Admin dashboard works
3. **Set Up SSL**: Most platforms auto-enable HTTPS
4. **Configure Domain**: Point your domain to platform
5. **Enable Monitoring**: Set up error tracking (Sentry)
6. **Backup Strategy**: Database backups enabled

---

## **SUPPORT RESOURCES**

- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs
- **Heroku Docs**: https://devcenter.heroku.com/
- **Django Deployment**: https://docs.djangoproject.com/en/4.2/howto/deployment/

---

**Ready to go live! 🚀**
