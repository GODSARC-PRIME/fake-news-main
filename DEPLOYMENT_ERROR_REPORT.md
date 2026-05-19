# Deployment Error Report - CheckDem Fake News Detection

**Report Date:** May 18, 2026  
**Project:** fake-news-main  
**Deployment Platform:** Railway  
**Status:** BLOCKED - Application crashes on startup

---

## PRIMARY ISSUE: ModuleNotFoundError on Railway

### Error Details
```
ModuleNotFoundError: No module named 'checkdem_backend'
```

### When It Occurs
- Build completes successfully ✓
- Migrations run successfully ✓
- Gunicorn worker process starts
- Worker attempts to import `checkdem_backend.wsgi:application`
- **CRASH** - Cannot find the Django module

### Root Causes Identified

#### 1. **Virtual Environments in Git** (HIGH PRIORITY)
- `fake-news-main/backend/venv/` directory (~500MB+) was committed to Git
- `fake-news-main/backend/venv_new/` directory also present
- These should be in `.gitignore`, not deployed to production
- Takes up massive space and carries system-specific Python binaries
- Last commit: 24.62 MB with venv files included

#### 2. **Working Directory Path Mismatch** (MEDIUM PRIORITY)
**Issue:**
- `start_web.sh` runs: `cd fake-news-main/backend` then `python manage.py migrate`
- At Railway startup, working directory is `/app/` not `/app/fake-news-main/`
- So the `cd` command expects `fake-news-main/backend` to exist at current level
- Actual extracted structure in container: `/app/fake-news-main/backend/` (nested)
- Result: Script can't find manage.py or set proper Python path

**Current Script:**
```bash
#!/bin/bash
cd fake-news-main/backend
export PYTHONPATH="/app/fake-news-main/backend:$PYTHONPATH"
python manage.py migrate --run-syncdb || exit 1
exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
```

#### 3. **No .gitignore for Python/Virtual Envs** (MEDIUM PRIORITY)
- No `.gitignore` file at repo root or in `fake-news-main/`
- All venv files tracked and deployed (massive bloat)
- Should exclude:
  - `venv/`, `venv_new/`
  - `__pycache__/`
  - `*.pyc`
  - `.env`
  - `*.egg-info/`
  - `build/`, `dist/`
  - `.DS_Store`, `*.swp`

#### 4. **Monorepo Structure Complexity** (LOW-MEDIUM PRIORITY)
- Repository has top-level config files (`Procfile`, `Dockerfile`, `start_web.sh`, `requirements.txt`)
- But actual code is nested in `fake-news-main/` subdirectory
- This double-nesting confuses Railway's path resolution
- Alternative: Move everything up one level (flatten structure)

---

## SECONDARY ISSUES

### Issue 1: start_web.sh Path Problem

**Current Code (BROKEN):**
```bash
#!/bin/bash
cd fake-news-main/backend  # ← WRONG: assumes working dir is repo root
export PYTHONPATH="/app/fake-news-main/backend:$PYTHONPATH"  # ← Too late, cd already failed
python manage.py migrate --run-syncdb || exit 1
exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
```

**Should Be:**
```bash
#!/bin/bash
cd /app/fake-news-main/backend  # Use absolute path
python manage.py migrate --run-syncdb || exit 1
exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
```

---

### Issue 2: Procfile Path Issues

**Current Code (PARTIALLY BROKEN):**
```ini
web: sh start_web.sh
worker: cd fake-news-main/backend && celery -A checkdem_backend worker -l info
beat: cd fake-news-main/backend && celery -A checkdem_backend beat -l info
```

**Problems:**
- `worker` and `beat` processes use relative paths (same issue as start_web.sh)
- Should use absolute paths or proper path from root of extracted code
- Alternative: Move Procfile inside `fake-news-main/`

**Should Be:**
```ini
web: sh start_web.sh
worker: cd /app/fake-news-main/backend && celery -A checkdem_backend worker -l info
beat: cd /app/fake-news-main/backend && celery -A checkdem_backend beat -l info
```

---

### Issue 3: PYTHONPATH Still Insufficient

- Even if path export works, Python module discovery depends on:
  - `checkdem_backend/` existing as a directory with `__init__.py` ✓ (verified)
  - Proper sys.path configuration (broken by relative paths)
  - Not importing from venv binaries (system-specific conflicts)

---

## DEPLOYMENT TIMELINE ANALYSIS

| Step | Status | Details |
|------|--------|---------|
| Git push | ✓ Success | 24.62 MB commit includes venv files (problematic) |
| Railway detect | ✓ Success | Triggered build on push |
| Pip install | ✓ Success | All packages from requirements.txt installed |
| Migrations | ✓ Success | `python manage.py migrate` runs without errors |
| Gunicorn start | ✓ Process starts | But worker crashes immediately after |
| Module import | ❌ FAIL | Cannot find `checkdem_backend` module |
| App status | ❌ CRASHED | Workers exit with code 3 (import error) |

---

## FILE STRUCTURE ISSUES

### Current Working Structure (Local)
```
C:\Users\ENNY\Desktop\fake-news-main-20260428T090211Z-3-001\
├── fake-news-main/
│   ├── backend/
│   │   ├── checkdem_backend/          ✓ Correct
│   │   │   ├── __init__.py
│   │   │   ├── settings.py
│   │   │   ├── wsgi.py
│   │   │   ├── urls.py
│   │   │   └── asgi.py
│   │   ├── validations/                ✓ Correct
│   │   ├── manage.py                   ✓ Correct
│   │   ├── db.sqlite3
│   │   ├── venv/                       ❌ Should NOT be in Git
│   │   └── venv_new/                   ❌ Should NOT be in Git
│   └── frontend/                        ✓ Correct
├── Procfile                             ⚠️ Paths need fixing
├── start_web.sh                         ❌ Paths broken
├── requirements.txt                     ✓ Correct
├── runtime.txt                          ✓ Correct
└── Dockerfile                           ✓ Exists but may have path issues
```

### Extracted Structure at Railway `/app/`
```
/app/
├── fake-news-main/
│   ├── backend/
│   │   ├── checkdem_backend/
│   │   ├── validations/
│   │   ├── manage.py
│   │   ├── venv/                       ← HUGE, slowdown, system-specific
│   │   └── venv_new/
│   └── frontend/
├── Procfile
└── start_web.sh
```

---

## ACTION ITEMS TO FIX

### Priority 1 (BLOCKING - DO FIRST)

1. **Create `.gitignore`**
   ```
   # Python
   __pycache__/
   *.py[cod]
   *$py.class
   *.so
   .Python
   env/
   venv/
   venv_new/
   ENV/
   build/
   develop-eggs/
   dist/
   downloads/
   eggs/
   .eggs/
   lib/
   lib64/
   parts/
   sdist/
   var/
   wheels/
   *.egg-info/
   .installed.cfg
   *.egg
   
   # Django
   *.log
   local_settings.py
   db.sqlite3
   .env
   
   # IDE
   .vscode/
   .idea/
   *.swp
   *.swo
   *~
   
   # OS
   .DS_Store
   Thumbs.db
   ```

2. **Remove venv from Git history**
   ```bash
   cd C:\Users\ENNY\Desktop\fake-news-main-20260428T090211Z-3-001
   git rm -r fake-news-main/backend/venv fake-news-main/backend/venv_new
   git commit -m "Remove virtual environments from git tracking"
   git push origin main
   ```

3. **Fix `start_web.sh` with absolute paths**
   ```bash
   #!/bin/bash
   cd /app/fake-news-main/backend
   python manage.py migrate --run-syncdb || exit 1
   exec gunicorn checkdem_backend.wsgi:application --bind 0.0.0.0:8000 --workers 1 --timeout 60
   ```

4. **Fix `Procfile` paths**
   ```ini
   web: sh start_web.sh
   worker: cd /app/fake-news-main/backend && celery -A checkdem_backend worker -l info
   beat: cd /app/fake-news-main/backend && celery -A checkdem_backend beat -l info
   ```

5. **Commit and push**
   ```bash
   git add .gitignore start_web.sh Procfile
   git commit -m "Fix: use absolute paths and add proper .gitignore for Railway deployment"
   git push origin main
   ```

### Priority 2 (OPTIONAL BUT RECOMMENDED)

6. **Flatten repo structure** (longer term improvement)
   - Move `fake-news-main/*` to repo root
   - Move `Procfile`, `start_web.sh`, `Dockerfile` to root
   - Update Procfile paths to `backend/` instead of `fake-news-main/backend/`
   - Update start_web.sh to `cd /app/backend`
   - This simplifies path resolution significantly
   
   **Benefits:**
   - Simpler path logic
   - Standard monorepo structure
   - Fewer path bugs in future

### Priority 3 (POLISH)

7. **Test locally before deploying**
   - Run migrations locally: `python fake-news-main/backend/manage.py migrate`
   - Test Gunicorn: `gunicorn checkdem_backend.wsgi:application`
   - Verify Celery: `celery -A checkdem_backend worker --loglevel=info`

8. **Add deployment documentation**
   - Document all environment variables needed
   - Document database setup on Railway
   - Document Redis setup for Celery

---

## QUICK REFERENCE: WHAT'S WORKING VS BROKEN

### ✓ WORKING
- Django application code (all models, views, serializers)
- Django migrations (all 21 applied successfully locally)
- API endpoints (all 22 verified functional locally)
- Requirements.txt (all dependencies installable)
- Frontend React code (builds and runs locally)
- Database schema (complete and functional)
- Authentication system (token-based auth works)

### ❌ BROKEN
- Module import path resolution at Railway startup
- start_web.sh relative paths
- Procfile relative paths for worker/beat
- Virtual environment bloat in Git (24.62 MB unnecessary)
- Working directory assumptions in deployment scripts

### ⚠️ NEEDS CONFIGURATION
- Environment variables (DJANGO_SECRET_KEY, DJANGO_DEBUG, DATABASE_URL, REDIS_URL)
- PostgreSQL database on Railway
- Redis service on Railway
- Email configuration (optional)
- Static files storage configuration

---

## EXPECTED OUTCOME AFTER FIXES

**After Priority 1 actions:**
- Build will be smaller (remove venv)
- Paths will resolve correctly
- Module import will succeed
- Application should boot to ACTIVE status
- Dashboard will be accessible at Railway public URL

**Estimated time to fix:** 5-10 minutes  
**Complexity:** Low (mainly configuration fixes, no code changes)

---

## NOTES FOR FUTURE DEPLOYMENTS

1. Always use absolute paths in deployment scripts (`/app/path/to/dir`)
2. Keep `.gitignore` updated - never commit venv, cache, or build artifacts
3. Test Procfile locally with `foreman` before pushing
4. Use environment variables for all sensitive/environment-specific config
5. Document all required environment variables clearly
6. Consider flattening repo structure to reduce path complexity

---

**Report prepared:** May 18, 2026  
**Severity:** HIGH - Blocking deployment  
**Recommended action:** Implement Priority 1 items immediately
