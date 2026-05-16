# checkdem_backend/urls.py

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from django.http import JsonResponse

# Root endpoint for testing
def home(request):
    return JsonResponse({"message": "Backend is live!"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', home),  # Root endpoint
    path('api/', include('validations.urls')),  # Your existing API routes
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)