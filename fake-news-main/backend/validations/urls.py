from django.urls import path

from . import views
from . import admin_views
from . import auth_views


urlpatterns = [
    path("validate/", views.validate_news, name="validate"),
    path("result/<uuid:submission_id>/", views.get_result, name="result"),
    path("recent/", views.get_recent, name="recent"),
    
    # Auth endpoints
    path("auth/login/", auth_views.login_view, name="login"),
    path("auth/logout/", auth_views.logout_view, name="logout"),
    path("auth/profile/", auth_views.profile_view, name="profile"),
    path("auth/check-admin/", auth_views.check_admin_status, name="check_admin"),
    path("auth/create-admin/", auth_views.create_admin_user, name="create_admin"),
    
    # Admin endpoints (protected by IsAdminUser)
    path("admin/stats/", admin_views.get_admin_stats, name="admin_stats"),
    path("admin/submissions/", admin_views.get_submissions_list, name="admin_submissions"),
    path("admin/trends/", admin_views.get_trends, name="admin_trends"),
    path("admin/activity/", admin_views.get_recent_activity, name="admin_activity"),
    path("admin/suspicious-words/", admin_views.get_suspicious_words_stats, name="admin_suspicious_words"),
    path("admin/system-usage/", admin_views.get_system_usage_report, name="admin_system_usage"),
    path("admin/submissions/<uuid:submission_id>/delete/", admin_views.delete_submission, name="admin_delete_submission"),
]
