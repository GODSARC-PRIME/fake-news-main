from django.db.models import Count, Avg, Q
from django.db.models.functions import TruncDate, TruncHour
from django.utils import timezone
from datetime import timedelta, datetime
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from collections import Counter
from django.contrib.auth.models import User  # ← FIXED: Added missing import

from .models import ValidationSubmission


# All admin views require admin privileges
admin_permission = permission_classes([IsAdminUser])


@api_view(["GET"])
@admin_permission
def get_admin_stats(request):
    """
    Get overall statistics for the admin dashboard.
    """
    total_submissions = ValidationSubmission.objects.count()
    completed_count = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    ).count()
    pending_count = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.PENDING
    ).count()
    failed_count = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.FAILED
    ).count()
    
    # Get classification results
    completed_submissions = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    )
    
    fake_count = 0
    real_count = 0
    
    for sub in completed_submissions:
        if sub.result and sub.result.get("classification", "").lower() == "fake":
            fake_count += 1
        elif sub.result and sub.result.get("classification", "").lower() == "real":
            real_count += 1
    
    # Average confidence score
    confidence_scores = []
    for sub in completed_submissions:
        if sub.result and sub.result.get("confidence_score"):
            confidence_scores.append(sub.result["confidence_score"])
    
    avg_confidence = sum(confidence_scores) / len(confidence_scores) if confidence_scores else 0
    
    # Language distribution
    languages = Counter()
    for sub in ValidationSubmission.objects.exclude(language=""):
        languages[sub.language] += 1
    
    return Response({
        "total_submissions": total_submissions,
        "completed": completed_count,
        "pending": pending_count,
        "failed": failed_count,
        "fake_detected": fake_count,
        "real_detected": real_count,
        "average_confidence": round(avg_confidence, 2),
        "language_distribution": dict(languages.most_common(10)),
    })


@api_view(["GET"])
@admin_permission
def get_submissions_list(request):
    """
    Get paginated list of all submissions with filtering options.
    """
    status_filter = request.query_params.get("status", None)
    classification = request.query_params.get("classification", None)
    limit = int(request.query_params.get("limit", 50))
    offset = int(request.query_params.get("offset", 0))
    
    queryset = ValidationSubmission.objects.all().order_by("-created_at")
    
    if status_filter:
        queryset = queryset.filter(processing_status__iexact=status_filter)
    
    if classification:
        if classification.lower() == "fake":
            queryset = queryset.filter(result__classification__iexact="fake")
        elif classification.lower() == "real":
            queryset = queryset.filter(result__classification__iexact="real")
    
    total = queryset.count()
    submissions = queryset[offset:offset + limit]
    
    data = []
    for sub in submissions:
        data.append({
            "id": str(sub.id),
            "created_at": sub.created_at,
            "updated_at": sub.updated_at,
            "processing_status": sub.processing_status,
            "language": sub.language or "",
            "input_type": _get_input_type(sub),
            "classification": sub.result.get("classification", "") if sub.result else "",
            "confidence_score": sub.result.get("confidence_score", 0) if sub.result else 0,
            "has_error": bool(sub.error_message),
        })
    
    return Response({
        "total": total,
        "offset": offset,
        "limit": limit,
        "results": data,
    })


def _get_input_type(submission):
    """Determine the input type for a submission."""
    if submission.input_audio:
        return "audio"
    elif submission.input_video:
        return "video"
    elif submission.input_url:
        return "url"
    elif submission.input_text:
        return "text"
    return "unknown"


@api_view(["GET"])
@admin_permission
def get_trends(request):
    """
    Get trend data for charts (daily submissions, classifications over time).
    """
    days = int(request.query_params.get("days", 30))
    since = timezone.now() - timedelta(days=days)
    
    # Daily submissions count
    daily_submissions = (
        ValidationSubmission.objects.filter(created_at__gte=since)
        .annotate(date=TruncDate("created_at"))
        .values("date")
        .annotate(count=Count("id"))
        .order_by("date")
    )
    
    # Daily classifications (fake vs real)
    completed = ValidationSubmission.objects.filter(
        created_at__gte=since,
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    ).annotate(date=TruncDate("created_at"))
    
    date_classifications = {}
    for sub in completed:
        date_str = sub.date.strftime("%Y-%m-%d") if hasattr(sub, "date") else sub.created_at.strftime("%Y-%m-%d")
        if date_str not in date_classifications:
            date_classifications[date_str] = {"fake": 0, "real": 0}
        
        if sub.result:
            classification = sub.result.get("classification", "").lower()
            if classification in ("fake", "real"):
                date_classifications[date_str][classification] += 1
    
    classification_trend = [
        {"date": date, **counts}
        for date, counts in sorted(date_classifications.items())
    ]
    
    return Response({
        "daily_submissions": list(daily_submissions),
        "classification_trend": classification_trend,
    })


@api_view(["GET"])
@admin_permission
def get_recent_activity(request):
    """
    Get recent activity summary (last 24 hours).
    """
    last_24h = timezone.now() - timedelta(hours=24)
    
    recent_count = ValidationSubmission.objects.filter(created_at__gte=last_24h).count()
    
    hourly = (
        ValidationSubmission.objects.filter(created_at__gte=last_24h)
        .annotate(hour=TruncHour("created_at"))
        .values("hour")
        .annotate(count=Count("id"))
        .order_by("hour")
    )
    
    recent_submissions = ValidationSubmission.objects.filter(
        created_at__gte=last_24h
    ).order_by("-created_at")[:10]
    
    recent_data = []
    for sub in recent_submissions:
        recent_data.append({
            "id": str(sub.id),
            "created_at": sub.created_at,
            "processing_status": sub.processing_status,
            "classification": sub.result.get("classification", "") if sub.result else "",
            "confidence_score": sub.result.get("confidence_score", 0) if sub.result else 0,
        })
    
    return Response({
        "total_last_24h": recent_count,
        "hourly_breakdown": list(hourly),
        "recent_submissions": recent_data,
    })


@api_view(["DELETE"])
@admin_permission
def delete_submission(request, submission_id):
    """
    Delete a specific submission (admin only).
    """
    try:
        submission = ValidationSubmission.objects.get(id=submission_id)
        submission.delete()
        return Response({"message": "Submission deleted successfully"})
    except ValidationSubmission.DoesNotExist:
        return Response(
            {"error": "Submission not found"},
            status=status.HTTP_404_NOT_FOUND  # Fixed: was HTTP_201_CREATED (wrong status code)
        )


@api_view(["POST"])
@permission_classes([AllowAny])
def bootstrap_admin(request):
    """
    Temporary endpoint to create the first admin user in production.
    Remove this endpoint after the first admin is created for security.
    """
    username = request.data.get("username", "admin")
    email = request.data.get("email", "admin@checkdem.com")
    password = request.data.get("password")
    
    if not password:
        return Response(
            {"error": "Password is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if any admin user already exists
    if User.objects.filter(is_staff=True).exists():
        return Response(
            {"error": "Admin user already exists. Use existing credentials or delete this endpoint."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create admin user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=True,
        is_superuser=True
    )
    
    token, _ = Token.objects.get_or_create(user=user)
    
    return Response({
        "message": "Admin user created successfully",
        "credentials": {
            "username": username,
            "email": email,
        },
        "token": token.key,
        "warning": "Please remove the bootstrap-admin endpoint for security."
    }, status=status.HTTP_201_CREATED)


@api_view(["GET"])
@admin_permission
def get_system_usage_report(request):
    """
    Get comprehensive system usage report with detailed analytics.
    """
    days = int(request.query_params.get("days", 30))
    since = timezone.now() - timedelta(days=days)
    
    total_submissions = ValidationSubmission.objects.count()
    recent_submissions = ValidationSubmission.objects.filter(created_at__gte=since).count()
    
    processing_stats = {}
    for status_choice in ValidationSubmission.ProcessingStatus.choices:
        status_label = status_choice[0]
        count = ValidationSubmission.objects.filter(processing_status=status_label).count()
        processing_stats[status_label.lower()] = {
            "count": count,
            "percentage": round((count / total_submissions * 100) if total_submissions > 0 else 0, 2)
        }
    
    input_types = {"text": 0, "url": 0, "audio": 0, "video": 0, "unknown": 0}
    for sub in ValidationSubmission.objects.all():
        input_type = _get_input_type(sub)
        input_types[input_type] += 1
    
    language_stats = Counter()
    for sub in ValidationSubmission.objects.exclude(language=""):
        language_stats[sub.language] += 1
    
    completed_submissions = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.COMPLETED
    )
    
    classification_stats = {"fake": 0, "real": 0, "unknown": 0}
    confidence_scores = []
    
    for sub in completed_submissions:
        if sub.result:
            classification = sub.result.get("classification", "").lower()
            if classification in classification_stats:
                classification_stats[classification] += 1
            else:
                classification_stats["unknown"] += 1
            
            confidence = sub.result.get("confidence_score", 0)
            if confidence:
                confidence_scores.append(confidence)
    
    confidence_distribution = {
        "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0
    }
    for score in confidence_scores:
        if score <= 20:
            confidence_distribution["0-20"] += 1
        elif score <= 40:
            confidence_distribution["21-40"] += 1
        elif score <= 60:
            confidence_distribution["41-60"] += 1
        elif score <= 80:
            confidence_distribution["61-80"] += 1
        else:
            confidence_distribution["81-100"] += 1
    
    hourly_usage = []
    for i in range(24):
        hour_start = timezone.now().replace(hour=i, minute=0, second=0, microsecond=0)
        hour_end = hour_start + timedelta(hours=1)
        count = ValidationSubmission.objects.filter(
            created_at__gte=hour_start,
            created_at__lt=hour_end
        ).count()
        hourly_usage.append({"hour": i, "count": count})
    
    daily_trends = []
    for i in range(days):
        date = (timezone.now() - timedelta(days=i)).date()
        count = ValidationSubmission.objects.filter(created_at__date=date).count()
        daily_trends.append({"date": date.isoformat(), "count": count})
    
    daily_trends.reverse()
    
    error_count = ValidationSubmission.objects.filter(
        processing_status=ValidationSubmission.ProcessingStatus.FAILED
    ).count()
    
    processing_times = []
    for sub in ValidationSubmission.objects.filter(
        started_at__isnull=False,
        completed_at__isnull=False
    ):
        processing_time = (sub.completed_at - sub.started_at).total_seconds()
        processing_times.append(processing_time)
    
    avg_processing_time = sum(processing_times) / len(processing_times) if processing_times else 0
    
    return Response({
        "report_period": {
            "days": days,
            "start_date": since.isoformat(),
            "end_date": timezone.now().isoformat()
        },
        "overview": {
            "total_submissions": total_submissions,
            "recent_submissions": recent_submissions,
            "growth_rate": round(((recent_submissions - (total_submissions - recent_submissions)) /
                                (total_submissions - recent_submissions) * 100)
                                if (total_submissions - recent_submissions) > 0 else 0, 2)
        },
        "processing_stats": processing_stats,
        "input_type_distribution": input_types,
        "language_analytics": dict(language_stats.most_common(10)),
        "classification_analytics": {
            "distribution": classification_stats,
            "average_confidence": round(sum(confidence_scores) / len(confidence_scores), 2) if confidence_scores else 0,
            "confidence_distribution": confidence_distribution,
            "total_classified": sum(classification_stats.values())
        },
        "usage_patterns": {
            "hourly_distribution": hourly_usage,
            "daily_trends": daily_trends
        },
        "performance_metrics": {
            "average_processing_time_seconds": round(avg_processing_time, 2),
            "error_rate": round((error_count / total_submissions * 100) if total_submissions > 0 else 0, 2),
            "success_rate": round(((total_submissions - error_count) / total_submissions * 100) if total_submissions > 0 else 0, 2)
        }
    })


@api_view(["GET"])
@admin_permission
def get_suspicious_words_stats(request):
    """
    Get statistics on most common suspicious words.
    """
    limit = int(request.query_params.get("limit", 20))
    
    all_suspicious_words = []
    submissions = ValidationSubmission.objects.exclude(suspicious_words__isnull=True)
    
    for sub in submissions:
        if sub.suspicious_words and isinstance(sub.suspicious_words, list):
            all_suspicious_words.extend(sub.suspicious_words)
        elif sub.suspicious_words and isinstance(sub.suspicious_words, dict):
            all_suspicious_words.extend(sub.suspicious_words.keys())
    
    word_counts = Counter(all_suspicious_words)
    
    return Response({
        "most_common_suspicious_words": word_counts.most_common(limit),
        "total_unique_words": len(word_counts),
    })
