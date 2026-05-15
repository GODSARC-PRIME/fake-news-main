# 🚀 RAILWAY DEPLOYMENT - QUICK START

Railway is the easiest way to deploy CheckDem. **5 minutes to production!**

---

## **Step 1: Prepare Git Repository**

```bash
cd fake-news-main
git init
git add .
git commit -m "Ready for deployment"
```

Push to GitHub:
```bash
git remote add origin https://github.com/YOUR-USERNAME/fake-news-main.git
git branch -M main
git push -u origin main
```

---

## **Step 2: Create Railway Account**

1. Go to **[railway.app](https://railway.app)**
2. Click "Start Now"
3. Sign up with **GitHub** (easiest)
4. Authorize Railway to access your repositories

---

## **Step 3: Create New Project**

1. Click "New Project"
2. Select "Deploy from GitHub"
3. Find your `fake-news-main` repository
4. Click "Deploy Now"

Railway auto-detects Python and Node.js!

---

## **Step 4: Add PostgreSQL Database**

1. In your project dashboard, click the **"+"** button
2. Search for "PostgreSQL"
3. Click "PostgreSQL"
4. Railway provisions it automatically ✅

Railway auto-creates the `DATABASE_URL` environment variable.

---

## **Step 5: Add Redis**

1. Click **"+"** again
2. Search for "Redis"
3. Click "Redis"
4. Done! ✅

Railway auto-creates the `REDIS_URL` environment variable.

---

## **Step 6: Configure Environment Variables**

### **Generate Django Secret Key**

Run this locally:
```bash
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

Example output:
```
v!^@-5_#kx2q8%9$@#^&*@#$%^&*()_+{}:<>?
```

### **Add Variables to Railway**

In Railway dashboard → Your Project → "Variables" tab:

| Variable | Value | Example |
|----------|-------|---------|
| `DJANGO_DEBUG` | `False` | (production mode) |
| `DJANGO_SECRET_KEY` | Paste from above | `v!^@-5_#kx2...` |
| `ADMIN_USERNAME` | `admin` | (or your username) |
| `ADMIN_EMAIL` | `admin@example.com` | Your email |
| `ADMIN_PASSWORD` | Something strong | `MySecure123!Pass` |

Leave `DATABASE_URL` and `REDIS_URL` - Railway sets these automatically.

---

## **Step 7: Trigger Deployment**

Push a small change to GitHub to trigger deployment:

```bash
echo "# Deployed on Railway" >> README.md
git add .
git commit -m "Deploy to Railway"
git push
```

Railway auto-deploys! ✅

Check the "Deployments" tab to see status.

---

## **Step 8: Verify Deployment**

1. Click on "web" service in Railway
2. Copy the public URL (e.g., `https://fake-news-api-prod.railway.app`)
3. Visit the URL → Should see Django "Page not found" (this is OK!)
4. Visit `/api/recent/` → Should see `[]` (empty submissions)

### **Test the API**

```bash
curl https://your-railway-url.railway.app/api/recent/
```

Should return: `[]`

---

## **Step 9: Deploy Frontend**

### **Option A: Vercel (Recommended)**

1. Go to **[vercel.com](https://vercel.com)**
2. Sign up with GitHub
3. Click "New Project"
4. Select `fake-news-main` repository
5. Set root directory to `frontend`
6. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
7. Click "Deploy"

Vercel deploys in ~1 minute! ✅

### **Option B: Railway (Single Platform)**

1. In your Railway project, click "+" → "GitHub Repo"
2. Select same `fake-news-main` repo
3. Set these:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run preview`
4. Add environment variable:
   ```
   VITE_API_URL=https://your-railway-backend-url.railway.app
   ```
5. Deploy

---

## **Step 10: Update CORS Settings**

Your backend needs to allow requests from frontend.

In [backend/checkdem_backend/settings.py](../backend/checkdem_backend/settings.py), update `CORS_ALLOWED_ORIGINS`:

```python
CORS_ALLOWED_ORIGINS = [
    "https://fake-news-self.vercel.app",  # Your Vercel frontend URL
    "https://your-railway-frontend.railway.app",  # If using Railway
    "http://localhost:5173",  # Keep for local testing
    "http://127.0.0.1:5173",
]
```

Push this change:
```bash
git add backend/checkdem_backend/settings.py
git commit -m "Update CORS for production"
git push
```

Railway auto-redeploys! ✅

---

## **Step 11: Test Production App**

1. Visit your Vercel frontend URL
2. Click "Start Verifying Now"
3. Submit a test URL
4. Check results page

Should work end-to-end! 🎉

---

## **Step 12: Set Up Custom Domain (Optional)**

### **In Railway:**
1. Go to your service
2. Click "Settings"
3. Add "Custom Domain"
4. Point your domain's DNS to Railway

---

## **PRICING**

- **PostgreSQL**: Included
- **Redis**: Included
- **Web service**: $5/month (or pro-rated)
- **Total**: ~$10-15/month for hobby project

---

## **TROUBLESHOOTING**

### **Deployment Failed**

Check logs:
1. Railway dashboard → Deployments
2. Click failed deployment
3. Scroll down to "Build Logs"
4. Look for error messages

Common issues:
- Missing `requirements.txt`
- Python version mismatch
- Port not set to 8000

### **Cannot Connect to Database**

If seeing `OperationalError: could not connect to server`:
- Wait 30 seconds for PostgreSQL to fully initialize
- Trigger a redeployment: `git commit --allow-empty && git push`

### **Admin Login Failing**

If admin user wasn't created:
1. SSH into Railway service
2. Run: `python backend/manage.py createsuperuser`
3. Follow prompts

### **API Calls Returning 403 (CORS Error)**

Check frontend console for CORS error:
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in settings.py
- Commit and push to trigger redeploy

---

## **WHAT'S RUNNING WHERE**

```
Railway Backend:
├── Django (port 8000) → Web requests
├── Celery Worker → Async tasks (validation)
├── PostgreSQL → Database
└── Redis → Message broker

Vercel Frontend:
└── React (Vite) → User interface
```

---

## **NEXT STEPS**

✅ App is live!

1. **Share the link** with friends
2. **Monitor logs** for errors
3. **Collect feedback** from users
4. **Add domain** for professional look
5. **Enable monitoring** with Sentry (free tier)

---

**🎉 Congratulations! Your app is in production!**

**Questions?** Check [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed guide.
