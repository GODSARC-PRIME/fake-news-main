from django.contrib import admin
from .models import ValidationSubmission


@admin.register(ValidationSubmission)
class ValidationSubmissionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "processing_status",
        "language",
        "input_type",           # computed — see below
        "classification_label", # computed — from result JSON
        "confidence_label",     # computed — from result JSON
        "suspicious_word_count",# computed — from suspicious_words
        "created_at",
        "started_at",
        "completed_at",
    )
    list_filter  = ("processing_status", "language", "created_at")
    search_fields = ("id", "input_text", "input_url")
    readonly_fields = (
        "id", "created_at", "updated_at", "started_at", "completed_at",
        "result", "suspicious_words",
    )

    # ── Computed columns ──────────────────────────────────────

    @admin.display(description="Input Type")
    def input_type(self, obj):
        if obj.input_audio: return "audio"
        if obj.input_video: return "video"
        if obj.input_url:   return "url"
        if obj.input_text:  return "text"
        return "—"

    @admin.display(description="Classification")
    def classification_label(self, obj):
        if obj.result:
            return obj.result.get("classification", "—")
        return "—"

    @admin.display(description="Confidence")
    def confidence_label(self, obj):
        if obj.result:
            score = obj.result.get("confidence_score")
            if score is not None:
                return f"{score}%"
        return "—"

    @admin.display(description="Suspicious Words")
    def suspicious_word_count(self, obj):
        if isinstance(obj.suspicious_words, list):
            n = len(obj.suspicious_words)
            return f"{n} word{'s' if n != 1 else ''}"
        return "—"
