"""
Collection of cURL commands for testing the Fake News Detection API
Save this file and run commands from terminal/PowerShell
"""

# ============================================
# 1. AUTHENTICATION TESTS
# ============================================

# Login and get token
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin\",\"password\":\"admin123\"}"

# Expected Response:
# {
#   "token": "your-token-here",
#   "user": {"id": 1, "username": "admin", "email": "admin@test.com"}
# }


# ============================================
# 2. VALIDATION TESTS (Text)
# ============================================

# Submit text for validation
curl -X POST http://localhost:8000/api/validate/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -F "text=The Earth is flat"

# Expected Response:
# {
#   "submission_id": "uuid-here",
#   "status": "PENDING",
#   "language": "en"
# }


# ============================================
# 3. VALIDATION TESTS (URL)
# ============================================

# Submit URL for validation
curl -X POST http://localhost:8000/api/validate/ \
  -H "Authorization: Token YOUR_TOKEN_HERE" \
  -F "url=https://example.com/article"

# Expected Response:
# {
#   "submission_id": "uuid-here",
#   "status": "PENDING"
# }


# ============================================
# 4. GET RESULTS
# ============================================

# Get validation results (replace with actual submission_id)
curl http://localhost:8000/api/result/550e8400-e29b-41d4-a716-446655440000/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Expected Response:
# {
#   "submission_id": "550e8400-e29b-41d4-a716-446655440000",
#   "created_at": "2024-05-01T10:00:00Z",
#   "processing_status": "COMPLETED",
#   "input_text": "The Earth is flat",
#   "language": "en",
#   "result": {...},
#   "suspicious_words": ["flat", "earth"],
#   "error_message": ""
# }


# ============================================
# 5. GET RECENT SUBMISSIONS
# ============================================

# Get recent submissions
curl http://localhost:8000/api/recent/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Expected Response:
# [
#   {
#     "id": "uuid-1",
#     "created_at": "2024-05-01T10:00:00Z",
#     "processing_status": "COMPLETED",
#     "language": "en",
#     "input_text": "..."
#   },
#   ...
# ]


# ============================================
# 6. ADMIN STATS
# ============================================

# Get aggregated statistics
curl http://localhost:8000/api/admin/stats/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# Expected Response:
# {
#   "total_submissions": 150,
#   "total_completed": 145,
#   "total_failed": 5,
#   "avg_processing_time": 5.2,
#   "languages": {"en": 100, "es": 30, "fr": 20}
# }


# ============================================
# 7. ADMIN SUBMISSIONS LIST
# ============================================

# Get all submissions (with optional filters)
curl "http://localhost:8000/api/admin/submissions/?limit=10&offset=0" \
  -H "Authorization: Token YOUR_TOKEN_HERE"

# With filters:
curl "http://localhost:8000/api/admin/submissions/?status=COMPLETED&language=en" \
  -H "Authorization: Token YOUR_TOKEN_HERE"


# ============================================
# 8. ADMIN TRENDS
# ============================================

# Get trends over time
curl http://localhost:8000/api/admin/trends/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"


# ============================================
# 9. ADMIN ACTIVITY
# ============================================

# Get recent activity
curl http://localhost:8000/api/admin/activity/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"


# ============================================
# 10. ADMIN SUSPICIOUS WORDS
# ============================================

# Get suspicious words statistics
curl http://localhost:8000/api/admin/suspicious-words/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"


# ============================================
# 11. DELETE SUBMISSION
# ============================================

# Delete a submission (replace with actual submission_id)
curl -X DELETE http://localhost:8000/api/admin/submissions/550e8400-e29b-41d4-a716-446655440000/delete/ \
  -H "Authorization: Token YOUR_TOKEN_HERE"


# ============================================
# POWERSHELL VERSIONS
# ============================================

# If using PowerShell, use these formats:

# Login (PowerShell)
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login/" `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body '{"username":"admin","password":"admin123"}'
$token = $response.token

# Submit validation (PowerShell)
$form = @{
    text = "The Earth is flat"
}
Invoke-RestMethod -Uri "http://localhost:8000/api/validate/" `
  -Method POST `
  -Headers @{"Authorization" = "Token $token"} `
  -Form $form

# Get results (PowerShell)
Invoke-RestMethod -Uri "http://localhost:8000/api/result/550e8400-e29b-41d4-a716-446655440000/" `
  -Method GET `
  -Headers @{"Authorization" = "Token $token"}
