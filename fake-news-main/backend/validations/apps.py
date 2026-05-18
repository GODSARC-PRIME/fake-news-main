from django.apps import AppConfig


class ValidationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "validations"

    def ready(self):
        # FIX #2: Connect the post_migrate signal so the admin user is created
        # automatically after `migrate` runs on a fresh Render/production deploy.
        # Using post_migrate (rather than calling it directly here) avoids
        # AppRegistryNotReady errors because the signal fires after all models load.
        from django.db.models.signals import post_migrate
        post_migrate.connect(_create_admin_on_migrate, sender=self)


def _create_admin_on_migrate(sender, **kwargs):
    """
    Create a superuser from environment variables if one doesn't already exist.

    Required env vars (set these in Render / your .env):
        ADMIN_USERNAME   — e.g. admin
        ADMIN_EMAIL      — e.g. admin@checkdem.io
        ADMIN_PASSWORD   — a strong password

    If any of the three variables are missing the function does nothing,
    so local development without those vars set won't break.
    """
    import os
    from django.contrib.auth import get_user_model

    User = get_user_model()

    username = os.getenv("ADMIN_USERNAME", "").strip()
    email    = os.getenv("ADMIN_EMAIL",    "").strip()
    password = os.getenv("ADMIN_PASSWORD", "").strip()

    if not (username and email and password):
        # Env vars not configured — skip silently.
        return

    if User.objects.filter(username=username).exists():
        # Already exists — nothing to do.
        return

    User.objects.create_superuser(username=username, email=email, password=password)
    print(f"[CheckDem] Superuser '{username}' created from environment variables.")
