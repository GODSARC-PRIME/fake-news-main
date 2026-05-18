"""
Django settings for checkdem_backend project.
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

# ─────────────────────────────────────────────
# Security & Debug
# ─────────────────────────────────────────────
DEBUG = os.getenv("DJANGO_DEBUG", "True").lower() in ["1", "true", "yes"]

# FIX #5: Raise hard error in production if SECRET_KEY is missing or insecure.
# In development the fallback is fine; in production it must be explicitly set.
_SECRET_KEY_DEFAULT = "django-insecure-ml0iq$s%iyzuegf#4@1j&$zpd2^hlf2hmjy&ejr2yua4lxm^q&"
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", _SECRET_KEY_DEFAULT if DEBUG else "")

if not SECRET_KEY:
    raise RuntimeError(
        "DJANGO_SECRET_KEY environment variable is not set. "
        "Set it in your .env file or hosting provider before deploying."
    )

if not DEBUG and SECRET_KEY == _SECRET_KEY_DEFAULT:
    raise RuntimeError(
        "You are running in production (DEBUG=False) with the default insecure SECRET_KEY. "
        "Generate a new key and set DJANGO_SECRET_KEY in your environment."
    )

# ─────────────────────────────────────────────
# Allowed Hosts
# ─────────────────────────────────────────────
ALLOWED_HOSTS = [
    h.strip()
    for h in os.getenv("DJANGO_ALLOWED_HOSTS", "").split(",")
    if h.strip()
]

if DEBUG:
    ALLOWED_HOSTS += ["localhost", "127.0.0.1"]

ALLOWED_HOSTS += ["fake-news-prri.onrender.com"]

# ─────────────────────────────────────────────
# Installed Apps
# ─────────────────────────────────────────────
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",
    "validations",
]

# ─────────────────────────────────────────────
# Middleware
# ─────────────────────────────────────────────
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "checkdem_backend.urls"

# ─────────────────────────────────────────────
# Templates
# ─────────────────────────────────────────────
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "checkdem_backend.wsgi.application"

# ─────────────────────────────────────────────
# Database
# ─────────────────────────────────────────────
DATABASES = {
    "default": dj_database_url.config(
        default=f"sqlite:///{os.getenv('DJANGO_SQLITE_PATH', str(BASE_DIR / 'db.sqlite3'))}",
        conn_max_age=600,
    )
}

# ─────────────────────────────────────────────
# Password Validation
# ─────────────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ─────────────────────────────────────────────
# Internationalisation
# ─────────────────────────────────────────────
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ─────────────────────────────────────────────
# Static & Media Files
# ─────────────────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
        "OPTIONS": {"location": BASE_DIR / "media", "base_url": "/media/"},
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"
    },
}

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# ─────────────────────────────────────────────
# REST Framework
# ─────────────────────────────────────────────
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
        "rest_framework.authentication.SessionAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    # FIX #7: Global pagination for all list endpoints.
    # Admin views use manual limit/offset; this covers any future ModelViewSet lists.
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
    "PAGE_SIZE": 50,
}

# ─────────────────────────────────────────────
# CORS
# FIX #6: Origins moved to .env — no more hardcoded Vercel URLs.
# Set DJANGO_CORS_ALLOWED_ORIGINS as a comma-separated list in your .env / Render env vars.
# Example:
#   DJANGO_CORS_ALLOWED_ORIGINS=https://fake-news-self.vercel.app,https://fake-news-nu.vercel.app
# ─────────────────────────────────────────────
_cors_env = os.getenv("DJANGO_CORS_ALLOWED_ORIGINS", "")
CORS_ALLOWED_ORIGINS = [o.strip() for o in _cors_env.split(",") if o.strip()]

# Always allow local dev origins so you don't have to set env vars just to run locally.
_local_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
for _o in _local_origins:
    if _o not in CORS_ALLOWED_ORIGINS:
        CORS_ALLOWED_ORIGINS.append(_o)

CORS_ALLOW_CREDENTIALS = True

# ─────────────────────────────────────────────
# Celery
# ─────────────────────────────────────────────
CELERY_BROKER_URL = os.getenv("CELERY_BROKER_URL", "redis://localhost:6379/0")
CELERY_RESULT_BACKEND = os.getenv("CELERY_RESULT_BACKEND", CELERY_BROKER_URL)
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
# CELERY_TASK_ALWAYS_EAGER makes tasks run synchronously — useful for tests/dev,
# but must be False in production so tasks actually go through the broker.
CELERY_TASK_ALWAYS_EAGER = os.getenv(
    "CELERY_TASK_ALWAYS_EAGER", "True" if DEBUG else "False"
).lower() in ["1", "true", "yes"]
CELERY_TASK_EAGER_PROPAGATES = True

# ─────────────────────────────────────────────
# Default Primary Key
# ─────────────────────────────────────────────
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
