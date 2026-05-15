from django.shortcuts import render

from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from langdetect import detect

from .models import ValidationSubmission
from .serializers import ValidationCreateSerializer
from .tasks import process_validation_submission


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def validate_news(request):
    serializer = ValidationCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data

    language = data.get("language", "") or ""
    if not language.strip() and data.get("text"):
        try:
            language = detect(data.get("text")[:2000])
        except Exception:
            language = ""

    submission = ValidationSubmission.objects.create(
        language=language,
        input_text=data.get("text", "") or "",
        input_url=data.get("url", "") or "",
        input_audio=data.get("audio"),
        input_video=data.get("video"),
        processing_status=ValidationSubmission.ProcessingStatus.PENDING,
    )

    process_validation_submission(str(submission.id))
    return Response(
        {
            "submission_id": str(submission.id),
            "status": submission.processing_status,
            "language": submission.language or "",
        },
        status=status.HTTP_202_ACCEPTED,
    )


@api_view(["GET"])
def get_result(request, submission_id):
    try:
        submission = ValidationSubmission.objects.get(id=submission_id)
    except ValidationSubmission.DoesNotExist:
        return Response(
            {"message": "Result not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(
        {
            "id": str(submission.id),
            "created_at": submission.created_at,
            "language": submission.language or "",
            "processing_status": submission.processing_status,
            "result": submission.result,
            "suspicious_words": submission.suspicious_words or [],
            "error_message": submission.error_message,
        }
    )


@api_view(["GET"])
def get_recent(request):
    qs = ValidationSubmission.objects.exclude(
        processing_status=ValidationSubmission.ProcessingStatus.FAILED
    ).order_by("-created_at")[:50]

    return Response(
        [
            {
                "id": str(item.id),
                "created_at": item.created_at,
                "language": item.language or "",
                "processing_status": item.processing_status,
                "result": item.result,
                "suspicious_words": item.suspicious_words or [],
            }
            for item in qs
        ]
    )
