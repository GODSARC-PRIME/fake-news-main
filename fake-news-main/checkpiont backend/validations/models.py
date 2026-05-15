from django.db import models
import uuid


class ValidationSubmission(models.Model):
    class ProcessingStatus(models.TextChoices):
        PENDING = "PENDING", "Pending"
        PROCESSING = "PROCESSING", "Processing"
        COMPLETED = "COMPLETED", "Completed"
        FAILED = "FAILED", "Failed"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    processing_status = models.CharField(
        max_length=16, choices=ProcessingStatus.choices, default=ProcessingStatus.PENDING
    )

    language = models.CharField(max_length=16, blank=True, default="")
    input_text = models.TextField(blank=True, default="")
    input_url = models.URLField(blank=True, default="")
    input_audio = models.FileField(upload_to="uploads/audio/", null=True, blank=True)
    input_video = models.FileField(upload_to="uploads/video/", null=True, blank=True)

    result = models.JSONField(null=True, blank=True)
    suspicious_words = models.JSONField(null=True, blank=True)
    error_message = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.id} ({self.processing_status})"
