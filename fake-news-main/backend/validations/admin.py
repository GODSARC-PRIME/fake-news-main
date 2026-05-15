from django.contrib import admin

from .models import ValidationSubmission


@admin.register(ValidationSubmission)
class ValidationSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "processing_status",
        "language",
        "created_at",
        "started_at",
        "completed_at",
    )
    list_filter = ("processing_status", "language", "created_at")
    search_fields = ("id", "input_text", "input_url")
