from django.test import TestCase
from django.test.utils import override_settings

from rest_framework.test import APIClient

from .models import ValidationSubmission


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
        self.assertEqual(res.data["status"], "PENDING")

        submission_id = res.data["submission_id"]
        submission = ValidationSubmission.objects.get(id=submission_id)
        self.assertEqual(submission.input_text, "Breaking: shocking secret revealed")

        result_res = self.client.get(f"/api/result/{submission_id}/")
        self.assertEqual(result_res.status_code, 200)
        self.assertEqual(result_res.data["id"], submission_id)
        self.assertIn(result_res.data["processing_status"], ["PENDING", "PROCESSING", "COMPLETED", "FAILED"])

    def test_recent_returns_list(self):
        ValidationSubmission.objects.create(input_text="hello", language="en")
        res = self.client.get("/api/recent/")
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.data, list)
