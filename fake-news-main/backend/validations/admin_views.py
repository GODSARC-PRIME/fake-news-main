"""
Admin API views — all require IsAdminUser permission.
"""

from collections import Counter
from datetime import timedelta

from django.db.models import Count
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from .models import ValidationSubmission


# Reusable permission decorator — apply to every view below.
_admin_only = permission_classes([IsAdminUser])


# ─────────────────────────────────────────────────────────────
# Helper
# ─────────────────────────────────────────────────────────────

def _get_input_type(sub):
    if sub.input_audio:  return "audio"
    if sub.input_video:  return "video"
    if sub.input_url:    return "url"
    if sub.input_text:   return "text"
    return "unknown"


# ─────────────────────────────────────────────────────────────
# Stats
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_admin_stats(request):
    """Overall statistics for the admin dashboard."""
    total = ValidationSubmission.objects.count()
    completed_qs = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    )

    fake_count = 0
    real_count = 0
    confidence_scores = []

    for sub in completed_qs:
        if not sub.result:
            continue
        cls = sub.result.get("classification", "").lower()
        if cls == "fake":
            fake_count += 1
        elif cls == "real":
            real_count += 1
        score = sub.result.get("confidence_score")
        if score is not None:
            confidence_scores.append(score)

    avg_confidence = (
        round(sum(confidence_scores) / len(confidence_scores), 1)
        if confidence_scores else 0
    )

    languages = Counter(
        sub.language
        for sub in ValidationSubmission.objects.exclude(language="")
    )

    # FIX: key names aligned with what StatsGrid.jsx reads
    #   total_submissions, fake_count, real_count, avg_confidence
    return Response({
        "total_submissions": total,
        "fake_count":        fake_count,
        "real_count":        real_count,
        "avg_confidence":    avg_confidence,
        "completed":  completed_qs.count(),
        "pending":    ValidationSubmission.objects.filter(
                          processing_status=ValidationSubmission.ProcessingStatus.PENDING
                      ).count(),
        "failed":     ValidationSubmission.objects.filter(
                          processing_status=ValidationSubmission.ProcessingStatus.FAILED
                      ).count(),
        "language_distribution": dict(languages.most_common(10)),
    })


# ─────────────────────────────────────────────────────────────
# Submissions list  (FIX #7: manual limit/offset pagination)
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_submissions_list(request):
    """
    Paginated list of all submissions.

    Query params:
        limit        — items per page (default 50, max 200)
        offset       — starting index  (default 0)
        status       — filter by processing_status
        classification — filter by fake|real
    """
    try:
        limit  = min(int(request.query_params.get("limit",  50)),  200)
        offset = max(int(request.query_params.get("offset", 0)),   0)
    except (ValueError, TypeError):
        limit, offset = 50, 0

    status_filter    = request.query_params.get("status")
    classification   = request.query_params.get("classification")

    qs = ValidationSubmission.objects.all().order_by("-created_at")

    if status_filter:
        qs = qs.filter(processing_status__iexact=status_filter)

    if classification:
        if classification.lower() == "fake":
            qs = qs.filter(result__classification__iexact="fake")
        elif classification.lower() == "real":
            qs = qs.filter(result__classification__iexact="real")

    total       = qs.count()
    submissions = qs[offset : offset + limit]

    # Shape matches AdminSubmissions.jsx column definitions:
    #   id, content_type, classification, confidence, created_at
    data = [
        {
            "id":             str(sub.id),
            "created_at":     sub.created_at,
            "updated_at":     sub.updated_at,
            "processing_status": sub.processing_status,
            "language":       sub.language or "",
            "content_type":   _get_input_type(sub),            # frontend reads content_type
            "classification": (sub.result or {}).get("classification", ""),
            "confidence":     (sub.result or {}).get("confidence_score", 0),
            "has_error":      bool(sub.error_message),
        }
        for sub in submissions
    ]

    return Response({
        "total":   total,
        "offset":  offset,
        "limit":   limit,
        "results": data,
    })


# ─────────────────────────────────────────────────────────────
# Trends
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_trends(request):
    """Daily submission and classification trends."""
    try:
        days = max(1, int(request.query_params.get("days", 30)))
    except (ValueError, TypeError):
        days = 30

    since = timezone.now() - timedelta(days=days)

    daily_submissions = (
        ValidationSubmission.objects.filter(created_at__gte=since)
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )

    completed = ValidationSubmission.objects.filter(
        created_at__gte=since,
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED,
    ).annotate(date=TruncDate("created_at"))

    date_cls = {}
    for sub in completed:
        date_str = sub.date.strftime("%Y-%m-%d")
        date_cls.setdefault(date_str, {"fake": 0, "real": 0})
        cls = (sub.result or {}).get("classification", "").lower()
        if cls in ("fake", "real"):
            date_cls[date_str][cls] += 1

    # AdminStats.jsx reads trends.daily_stats as {date: count}
    daily_stats = {
        str(row["date"]): row["count"]
        for row in daily_submissions
    }

    return Response({
        "daily_stats":          daily_stats,
        "classification_trend": [
            {"date": d, **counts}
            for d, counts in sorted(date_cls.items())
        ],
    })


# ─────────────────────────────────────────────────────────────
# Recent Activity
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_recent_activity(request):
    """Recent activity summary — last 24 hours."""
    last_24h = timezone.now() - timedelta(hours=24)

    recent_count = ValidationSubmission.objects.filter(
        created_at__gte=last_24h
    ).count()

    hourly = (
        ValidationSubmission.objects.filter(created_at__gte=last_24h)
        .annotate(hour=TruncHour("created_at"))
        .values("hour")
        .annotate(count=Count("id"))
        .order_by("hour")
    )

    recent_subs = (
        ValidationSubmission.objects.filter(created_at__gte=last_24h)
        .order_by("-created_at")[:10]
    )

    # AdminDashboard.jsx reads item.content_type and item.classification
    recent_data = [
        {
            "id":             str(sub.id),
            "created_at":     sub.created_at,
            "processing_status": sub.processing_status,
            "content_type":   _get_input_type(sub),
            "classification": (sub.result or {}).get("classification", ""),
            "confidence":     (sub.result or {}).get("confidence_score", 0),
        }
        for sub in recent_subs
    ]

    return Response({
        "total_last_24h":   recent_count,
        "hourly_breakdown": list(hourly),
        "recent_submissions": recent_data,
    })


# ─────────────────────────────────────────────────────────────
# Delete submission
# ─────────────────────────────────────────────────────────────

@api_view(["DELETE"])
@_admin_only
def delete_submission(request, submission_id):
    """Delete a specific submission."""
    try:
        submission = ValidationSubmission.objects.get(id=submission_id)
        submission.delete()
        return Response({"message": "Submission deleted successfully"})
    except ValidationSubmission.DoesNotExist:
        return Response(
            {"error": "Submission not found"},
            status=status.HTTP_404_NOT_FOUND,
        )


# ─────────────────────────────────────────────────────────────
# Suspicious words
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_suspicious_words_stats(request):
    """Most common suspicious words found across all submissions."""
    try:
        limit = max(1, int(request.query_params.get("limit", 20)))
    except (ValueError, TypeError):
        limit = 20

    all_words = []
    for sub in ValidationSubmission.objects.exclude(suspicious_words__isnull=True):
        if isinstance(sub.suspicious_words, list):
            all_words.extend(sub.suspicious_words)
        elif isinstance(sub.suspicious_words, dict):
            all_words.extend(sub.suspicious_words.keys())

    word_counts = Counter(all_words)

    # AdminStats.jsx reads suspiciousWords.word_frequency as {word: count}
    return Response({
        "word_frequency":   dict(word_counts.most_common(limit)),
        "total_unique_words": len(word_counts),
    })


# ─────────────────────────────────────────────────────────────
# System usage report
# ─────────────────────────────────────────────────────────────

@api_view(["GET"])
@_admin_only
def get_system_usage_report(request):
    """Comprehensive system usage analytics."""
    try:
        days = max(1, int(request.query_params.get("days", 30)))
    except (ValueError, TypeError):
        days = 30

    since = timezone.now() - timedelta(days=days)
    total = ValidationSubmission.objects.count()
    recent = ValidationSubmission.objects.filter(created_at__gte=since).count()

    processing_stats = {}
    for choice_value, _ in ValidationSubmission.ProcessingStatus.choices:
        count = ValidationSubmission.objects.filter(
            processing_status=choice_value
        ).count()
        processing_stats[choice_value.lower()] = {
            "count": count,
            "percentage": round((count / total * 100) if total else 0, 2),
        }

    input_types = {"text": 0, "url": 0, "audio": 0, "video": 0, "unknown": 0}
    for sub in ValidationSubmission.objects.all():
        input_types[_get_input_type(sub)] += 1

    language_stats = Counter(
        sub.language
        for sub in ValidationSubmission.objects.exclude(language="")
    )

    completed_qs = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    )
    classification_stats = {"fake": 0, "real": 0, "unknown": 0}
    confidence_scores = []

    for sub in completed_qs:
        if sub.result:
            cls = sub.result.get("classification", "").lower()
            if cls in classification_stats:
                classification_stats[cls] += 1
            else:
                classification_stats["unknown"] += 1
            score = sub.result.get("confidence_score")
            if score is not None:
                confidence_scores.append(score)

    confidence_distribution = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0}
    for score in confidence_scores:
        if   score <= 20: confidence_distribution["0-20"]   += 1
        elif score <= 40: confidence_distribution["21-40"]  += 1
        elif score <= 60: confidence_distribution["41-60"]  += 1
        elif score <= 80: confidence_distribution["61-80"]  += 1
        else:             confidence_distribution["81-100"] += 1

    hourly_usage = []
    now = timezone.now()
    for i in range(24):
        h_start = now.replace(hour=i, minute=0, second=0, microsecond=0)
        h_end   = h_start + timedelta(hours=1)
        hourly_usage.append({
            "hour":  i,
            "count": ValidationSubmission.objects.filter(
                created_at__gte=h_start, created_at__lt=h_end
            ).count(),
        })

    daily_trends = []
    for i in range(days - 1, -1, -1):
        date  = (now - timedelta(days=i)).date()
        count = ValidationSubmission.objects.filter(created_at__date=date).count()
        daily_trends.append({"date": date.isoformat(), "count": count})

    error_count = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.FAILED
    ).count()

    processing_times = [
        (sub.completed_at - sub.started_at).total_seconds()
        for sub in ValidationSubmission.objects.filter(
            started_at__isnull=False, completed_at__isnull=False
        )
    ]
    avg_processing_time = (
        sum(processing_times) / len(processing_times) if processing_times else 0
    )

    prev_period = total - recent
    growth_rate = (
        round(((recent - prev_period) / prev_period * 100), 2)
        if prev_period > 0 else 0
    )

    return Response({
        "report_period": {
            "days": days,
            "start_date": since.isoformat(),
            "end_date": now.isoformat(),
        },
        "overview": {
            "total_submissions": total,
            "recent_submissions": recent,
            "growth_rate": growth_rate,
        },
        "processing_stats": processing_stats,
        "input_type_distribution": input_types,
        "language_analytics": dict(language_stats.most_common(10)),
        "classification_analytics": {
            "distribution": classification_stats,
            "average_confidence": round(
                sum(confidence_scores) / len(confidence_scores), 2
            ) if confidence_scores else 0,
            "confidence_distribution": confidence_distribution,
            "total_classified": sum(classification_stats.values()),
        },
        "usage_patterns": {
            "hourly_distribution": hourly_usage,
            "daily_trends": daily_trends,
        },
        "performance_metrics": {
            "average_processing_time_seconds": round(avg_processing_time, 2),
            "error_rate":    round((error_count / total * 100) if total else 0, 2),
            "success_rate":  round(((total - error_count) / total * 100) if total else 0, 2),
        },
    })

# ─────────────────────────────────────────────────────────────
# FIX #1: bootstrap_admin endpoint REMOVED.
#
# Admin creation is now handled automatically at deploy time via the
# post_migrate signal in validations/apps.py using these env vars:
#   ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD
#
# If you need to add a new admin manually, use the Django management command:
#   python manage.py createsuperuser
# ─────────────────────────────────────────────────────────────
