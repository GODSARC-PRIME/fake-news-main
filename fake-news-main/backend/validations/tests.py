from django.test import TestCase
from django.test.utils import override_settings
from django.contrib.auth.models import User

from rest_framework.test import APIClient
from rest_framework.authtoken.models import Token

from .models import ValidationSubmission


# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

def make_admin(username="admin_test", password="testpass123"):
    user = User.objects.create_superuser(
        username=username, email=f"{username}@test.com", password=password
    )
    token, _ = Token.objects.get_or_create(user=user)
    return user, token


def make_regular_user(username="user_test", password="testpass123"):
    user = User.objects.create_user(
        username=username, email=f"{username}@test.com", password=password
    )
    token, _ = Token.objects.get_or_create(user=user)
    return user, token


# ─────────────────────────────────────────────────────────────
# Validation flow tests
# ─────────────────────────────────────────────────────────────

@override_settings(CELERY_TASK_ALWAYS_EAGER=True)
class ValidationApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_validate_creates_submission(self):
        res = self.client.post(
            "/api/validate/",
            data={"text": "Breaking: shocking secret revealed", "language": "en"},
            format="multipart",
        )
        self.assertEqual(res.status_code, 202)
        self.assertIn("submission_id", res.data)
        self.assertIn("id", res.data)  # normalised key also present
        self.assertEqual(res.data["status"], "PENDING")

        submission_id = res.data["submission_id"]
        submission = ValidationSubmission.objects.get(id=submission_id)
        self.assertEqual(submission.input_text, "Breaking: shocking secret revealed")

    def test_result_shape_matches_frontend(self):
        """
        FIX #4: Ensure get_result returns the keys ResultPage.jsx expects.
        """
        sub = ValidationSubmission.objects.create(
            input_text="Some article",
            language="en",
            processing_status=ValidationSubmission.ProcessingStatus.COMPLETED,
            result={
                "classification": "fake",
                "confidence_score": 87,
                "explanation": "Clickbait detected.",
                "sources": [{"type": "source", "value": "https://example.com"}],
                "validator": "heuristic",
                "ai_error": "",
                "transcript": "",
            },
            suspicious_words=["breaking", "shocking"],
        )

        res = self.client.get(f"/api/result/{sub.id}/")
        self.assertEqual(res.status_code, 200)

        # Keys the frontend reads
        self.assertEqual(res.data["classification"],   "fake")
        self.assertEqual(res.data["confidence"],       87)       # renamed from confidence_score
        self.assertEqual(res.data["explanation"],      "Clickbait detected.")
        self.assertEqual(res.data["suspicious_elements"], ["breaking", "shocking"])
        # Sources flattened to strings
        self.assertEqual(res.data["sources"], ["https://example.com"])
        # Status key present
        self.assertIn("status", res.data)

    def test_result_pending_while_processing(self):
        sub = ValidationSubmission.objects.create(
            input_text="test",
            processing_status=ValidationSubmission.ProcessingStatus.PENDING,
        )
        res = self.client.get(f"/api/result/{sub.id}/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["status"], "PENDING")

    def test_result_not_found(self):
        res = self.client.get("/api/result/00000000-0000-0000-0000-000000000000/")
        self.assertEqual(res.status_code, 404)

    def test_recent_returns_list(self):
        ValidationSubmission.objects.create(input_text="hello", language="en")
        res = self.client.get("/api/recent/")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.data, list)

    def test_validate_requires_content(self):
        res = self.client.post("/api/validate/", data={}, format="multipart")
        self.assertEqual(res.status_code, 400)


# ─────────────────────────────────────────────────────────────
# Auth tests
# ─────────────────────────────────────────────────────────────

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user, self.token = make_regular_user()
        self.admin, self.admin_token = make_admin()

    def test_login_valid_credentials(self):
        res = self.client.post(
            "/api/auth/login/",
            {"username": "user_test", "password": "testpass123"},
            format="json",
        )
        self.assertEqual(res.status_code, 200)
        self.assertIn("token", res.data)
        self.assertIn("user", res.data)

    def test_login_invalid_credentials(self):
        res = self.client.post(
            "/api/auth/login/",
            {"username": "user_test", "password": "wrongpass"},
            format="json",
        )
        self.assertEqual(res.status_code, 401)

    def test_login_missing_fields(self):
        res = self.client.post("/api/auth/login/", {}, format="json")
        self.assertEqual(res.status_code, 400)

    def test_profile_requires_auth(self):
        res = self.client.get("/api/auth/profile/")
        self.assertEqual(res.status_code, 401)

    def test_profile_returns_user_data(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        res = self.client.get("/api/auth/profile/")
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data["username"], "user_test")

    def test_check_admin_regular_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        res = self.client.get("/api/auth/check-admin/")
        self.assertEqual(res.status_code, 200)
        self.assertFalse(res.data["is_admin"])

    def test_check_admin_admin_user(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        res = self.client.get("/api/auth/check-admin/")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.data["is_admin"])

    def test_logout_deletes_token(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        res = self.client.post("/api/auth/logout/")
        self.assertEqual(res.status_code, 200)
        # Token should be gone — next request should 401
        res2 = self.client.get("/api/auth/profile/")
        self.assertEqual(res2.status_code, 401)

    def test_create_admin_requires_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        res = self.client.post(
            "/api/auth/create-admin/",
            {"username": "newadmin", "password": "newpass123"},
            format="json",
        )
        self.assertEqual(res.status_code, 403)

    def test_create_admin_by_admin(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.admin_token.key}")
        res = self.client.post(
            "/api/auth/create-admin/",
            {"username": "newadmin2", "email": "new2@test.com", "password": "newpass123"},
            format="json",
        )
        self.assertEqual(res.status_code, 201)
        self.assertTrue(User.objects.filter(username="newadmin2").exists())


# ─────────────────────────────────────────────────────────────
# Admin endpoint tests
# ─────────────────────────────────────────────────────────────

class AdminEndpointTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin, self.admin_token = make_admin()
        self.user,  self.user_token  = make_regular_user()

        # Seed a completed submission with a known result
        self.sub = ValidationSubmission.objects.create(
            input_text="Shocking secret exposed!!!",
            language="en",
            processing_status=ValidationSubmission.ProcessingStatus.COMPLETED,
            result={
                "classification": "fake",
                "confidence_score": 84,
                "explanation": "Clickbait patterns.",
                "sources": [],
                "validator": "heuristic",
                "ai_error": "",
                "transcript": "",
            },
            suspicious_words=["shocking", "exposed"],
        )

    def _auth(self, token):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

    # ── Access control ──

    def test_admin_stats_requires_admin(self):
        self._auth(self.user_token)
        res = self.client.get("/api/admin/stats/")
        self.assertEqual(res.status_code, 403)

    def test_admin_stats_accessible_by_admin(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/stats/")
        self.assertEqual(res.status_code, 200)

    # ── Stats shape ──

    def test_admin_stats_keys(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/stats/")
        for key in ("total_submissions", "fake_count", "real_count", "avg_confidence"):
            self.assertIn(key, res.data, msg=f"Missing key: {key}")

    def test_admin_stats_fake_count(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/stats/")
        self.assertEqual(res.data["fake_count"], 1)
        self.assertEqual(res.data["real_count"], 0)

    # ── Submissions list ──

    def test_submissions_list_pagination(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/submissions/?limit=10&offset=0")
        self.assertEqual(res.status_code, 200)
        self.assertIn("total",   res.data)
        self.assertIn("results", res.data)
        self.assertIn("limit",   res.data)
        self.assertIn("offset",  res.data)

    def test_submissions_list_content_type_key(self):
        """Ensure the frontend-facing 'content_type' key is present."""
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/submissions/")
        self.assertGreater(len(res.data["results"]), 0)
        self.assertIn("content_type", res.data["results"][0])

    def test_submissions_list_filter_by_classification(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/submissions/?classification=fake")
        self.assertEqual(res.status_code, 200)
        for item in res.data["results"]:
            self.assertEqual(item["classification"].lower(), "fake")

    # ── Trends ──

    def test_trends_contains_daily_stats(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/trends/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("daily_stats", res.data)
        self.assertIn("classification_trend", res.data)

    # ── Activity ──

    def test_recent_activity_keys(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/activity/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("recent_submissions", res.data)

    # ── Suspicious words ──

    def test_suspicious_words_shape(self):
        self._auth(self.admin_token)
        res = self.client.get("/api/admin/suspicious-words/")
        self.assertEqual(res.status_code, 200)
        self.assertIn("word_frequency", res.data)
        wf = res.data["word_frequency"]
        self.assertIn("shocking", wf)
        self.assertIn("exposed",  wf)

    # ── Delete ──

    def test_delete_submission(self):
        self._auth(self.admin_token)
        res = self.client.delete(
            f"/api/admin/submissions/{self.sub.id}/delete/"
        )
        self.assertEqual(res.status_code, 200)
        self.assertFalse(
            ValidationSubmission.objects.filter(id=self.sub.id).exists()
        )

    def test_delete_nonexistent_submission(self):
        self._auth(self.admin_token)
        res = self.client.delete(
            "/api/admin/submissions/00000000-0000-0000-0000-000000000000/delete/"
        )
        self.assertEqual(res.status_code, 404)

    # ── FIX #1: bootstrap_admin must not exist ──

    def test_bootstrap_admin_endpoint_removed(self):
        """Security regression test — this route must 404 after the fix."""
        res = self.client.post(
            "/api/bootstrap-admin/",
            {"password": "anything"},
            format="json",
        )
        self.assertEqual(res.status_code, 404)
