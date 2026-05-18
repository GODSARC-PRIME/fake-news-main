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

    # FIX #3: Use .delay() so the task runs asynchronously through Celery.
    # When CELERY_TASK_ALWAYS_EAGER=True (dev/test) this still works synchronously.
    process_validation_submission.delay(str(submission.id))

    return Response(
        {
            "submission_id": str(submission.id),
            # Normalise to 'id' as well so the frontend can use either key.
            "id": str(submission.id),
            "status": submission.processing_status,
            "language": submission.language or "",
        },
        status=status.HTTP_202_ACCEPTED,
    )


def _normalise_result(submission):
    """
    FIX #4: Shape the API response so it matches exactly what ResultPage.jsx reads.

    Frontend expects at the top level:
        id, status, classification, confidence, explanation,
        suspicious_elements, sources

    Backend stores:
        processing_status, result (JSON blob with confidence_score not confidence),
        suspicious_words (not suspicious_elements)
    """
    result_blob = submission.result or {}

    # Sources: backend stores [{type, value}, ...] objects; frontend does href={source}
    # so we flatten to plain strings.
    raw_sources = result_blob.get("sources") or []
    sources = []
    for s in raw_sources:
        if isinstance(s, dict):
            sources.append(s.get("value", ""))
        elif isinstance(s, str):
            sources.append(s)
    sources = [s for s in sources if s]  # drop empty strings

    return {
        "id": str(submission.id),
        "created_at": submission.created_at,
        "language": submission.language or "",

        # Unified status key — frontend ResultPage polls on status == "pending"
        "status": submission.processing_status,
        "processing_status": submission.processing_status,  # kept for backwards compat

        # Top-level classification fields the frontend reads directly
        "classification": result_blob.get("classification", ""),
        "confidence":     result_blob.get("confidence_score", 0),   # renamed key
        "explanation":    result_blob.get("explanation", ""),
        "suspicious_elements": submission.suspicious_words or [],    # renamed key
        "sources": sources,

        # Additional detail for any consumers that want the full picture
        "validator": result_blob.get("validator", ""),
        "ai_error":  result_blob.get("ai_error", ""),
        "transcript": result_blob.get("transcript", ""),
        "error_message": submission.error_message,
    }


@api_view(["GET"])
def get_result(request, submission_id):
    try:
        submission = ValidationSubmission.objects.get(id=submission_id)
    except ValidationSubmission.DoesNotExist:
        return Response(
            {"message": "Result not found"}, status=status.HTTP_404_NOT_FOUND
        )

    return Response(_normalise_result(submission))


@api_view(["GET"])
def get_recent(request):
    qs = (
        ValidationSubmission.objects.exclude(
            processing_status=ValidationSubmission.ProcessingStatus.FAILED
        )
        .order_by("-created_at")[:50]
    )
    return Response([_normalise_result(item) for item in qs])
