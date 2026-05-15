# Testing Checklist for Fake News Detection Platform

## Pre-Testing Setup
- [ ] Python 3.10+ installed
- [ ] Node.js 18+ installed
- [ ] Git installed
- [ ] Backend virtual environment created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] `.env` files configured
- [ ] Database migrations completed
- [ ] Admin user created

---

## Backend Tests

### Server Startup
- [ ] Backend server starts without errors
- [ ] No Python exceptions in console
- [ ] Server listens on port 8000
- [ ] Django admin panel accessible at `/admin`
- [ ] Can login to admin panel with credentials

### Database & Migrations
- [ ] `python manage.py migrate` runs successfully
- [ ] `db.sqlite3` is created
- [ ] All tables created properly
- [ ] Admin user created in database

### API Connectivity
- [ ] Root endpoint `/` returns "Backend is live!"
- [ ] API root `/api/` is accessible
- [ ] CORS headers are present in responses
- [ ] Content-Type headers are correct

### Authentication Endpoints
- [ ] `POST /api/auth/login/` works with valid credentials
- [ ] Returns token in response
- [ ] `POST /api/auth/login/` fails with invalid credentials
- [ ] `GET /api/auth/profile/` returns user info when authenticated
- [ ] `GET /api/auth/check-admin/` returns admin status
- [ ] `POST /api/auth/logout/` works

### Validation Endpoints
- [ ] `POST /api/validate/` accepts text input
- [ ] Returns submission_id in response
- [ ] Returns processing status
- [ ] Detects language correctly
- [ ] `POST /api/validate/` accepts URL input
- [ ] Form validation works (required fields)
- [ ] `GET /api/result/{submission_id}/` returns results
- [ ] Returns correct submission data
- [ ] `GET /api/recent/` returns recent submissions

### Admin Endpoints (Require Authentication)
- [ ] `GET /api/admin/stats/` returns statistics
- [ ] Returns total_submissions count
- [ ] Returns total_completed count
- [ ] Returns processing metrics
- [ ] `GET /api/admin/submissions/` returns submissions list
- [ ] Pagination works
- [ ] Filtering works (status, language)
- [ ] `GET /api/admin/trends/` returns trend data
- [ ] `GET /api/admin/activity/` returns activity log
- [ ] `GET /api/admin/suspicious-words/` returns word stats
- [ ] `GET /api/admin/system-usage/` returns system metrics
- [ ] `DELETE /api/admin/submissions/{id}/delete/` deletes submission

### Error Handling
- [ ] Invalid submission_id returns 404
- [ ] Unauthorized requests return 401
- [ ] Malformed requests return 400
- [ ] Server errors return 500 with message
- [ ] Validation errors include helpful messages

---

## Frontend Tests

### Page Load & Navigation
- [ ] Home page loads (http://localhost:5173/)
- [ ] All pages load without JS errors
- [ ] Navigation menu is visible
- [ ] Page titles are correct
- [ ] Responsive design on mobile (test with dev tools)
- [ ] No console errors on any page

### Public Pages
- [ ] **Home Page**
  - [ ] Content displays correctly
  - [ ] Call-to-action buttons visible
  - [ ] Images/logos load
  
- [ ] **Login Page**
  - [ ] Form displays
  - [ ] Email/username field works
  - [ ] Password field is masked
  - [ ] Submit button works
  - [ ] Error messages display for failed login
  - [ ] Successful login redirects to dashboard/home

- [ ] **Validation Page**
  - [ ] Form displays
  - [ ] Text input field works
  - [ ] URL input field works
  - [ ] Language selection works (if available)
  - [ ] Submit button validates form before sending
  - [ ] Loading spinner shows during submission
  - [ ] Success message appears after submission
  - [ ] Submission ID is returned and displayed

- [ ] **Results Page**
  - [ ] Accessible with valid submission_id
  - [ ] Displays submission details
  - [ ] Shows processing status
  - [ ] Shows results if processing complete
  - [ ] Shows suspicious words if available
  - [ ] Shows error if submission not found
  - [ ] "Back to Dashboard" button works
  - [ ] Can share submission ID

### Protected Pages (Require Admin Login)
- [ ] **Admin Dashboard**
  - [ ] Requires login to access
  - [ ] Redirects to login if not authenticated
  - [ ] Shows dashboard overview
  - [ ] Displays statistics cards
  - [ ] Statistics numbers are correct
  - [ ] Charts/graphs render (if present)

- [ ] **Admin Stats**
  - [ ] Shows detailed statistics
  - [ ] Time period selector works
  - [ ] Export functionality works (if available)
  - [ ] Data updates when filters change

- [ ] **Admin Submissions**
  - [ ] Shows list of all submissions
  - [ ] Pagination works
  - [ ] Search/filter works
  - [ ] Sort by column works
  - [ ] Can view submission details
  - [ ] Can delete submission
  - [ ] Delete confirmation appears
  - [ ] After delete, submission removed from list

### Authentication & Authorization
- [ ] Cannot access `/admin` without login
- [ ] Cannot access `/admin/stats` without login
- [ ] Cannot access `/admin/submissions` without login
- [ ] Login sets auth token in localStorage/sessionStorage
- [ ] Token persists on page refresh
- [ ] Logout clears token
- [ ] Logout redirects to login page
- [ ] AuthContext provides correct user info
- [ ] Admin status is correctly detected

### Form Validation
- [ ] Empty text field shows validation error
- [ ] Empty URL field shows validation error
- [ ] Invalid URL format shows error
- [ ] Text length limits are enforced
- [ ] Error messages are clear and helpful

### API Integration
- [ ] Frontend calls correct API endpoints
- [ ] API responses are processed correctly
- [ ] Error responses display error messages
- [ ] Loading states show/hide properly
- [ ] Network errors are handled gracefully
- [ ] Tokens are sent in Authorization header

### UI/UX
- [ ] All buttons are clickable
- [ ] Buttons show loading state during requests
- [ ] Buttons are disabled during processing
- [ ] Hover effects work on links/buttons
- [ ] Color scheme is consistent
- [ ] Fonts are readable
- [ ] Spacing is consistent
- [ ] Mobile layout is responsive

---

## Integration Tests (Full Workflow)

### User Journey: Text Validation
- [ ] User navigates to home page
- [ ] User clicks "Validate" or navigates to `/validate`
- [ ] User enters text in validation form
- [ ] User submits form
- [ ] API call is made successfully
- [ ] Submission ID is returned
- [ ] User is redirected to results page
- [ ] Results page shows processing status
- [ ] After processing, results display

### User Journey: Login → Admin Dashboard
- [ ] User navigates to login page
- [ ] User enters admin credentials
- [ ] Login is successful
- [ ] User is redirected to dashboard/home
- [ ] User can navigate to `/admin`
- [ ] Admin dashboard loads
- [ ] Statistics are displayed
- [ ] User can view submissions
- [ ] User can delete submission
- [ ] User can logout

### User Journey: Multi-Language Support
- [ ] Submit text in English
- [ ] Language is detected as "en"
- [ ] Submit text in Spanish
- [ ] Language is detected as "es"
- [ ] Results display language correctly

---

## Performance Tests

### Load Testing
- [ ] Backend handles multiple simultaneous submissions
- [ ] Frontend remains responsive with multiple tabs open
- [ ] No memory leaks on long usage
- [ ] API responds within reasonable time (<5s)

### Database Performance
- [ ] Queries complete quickly
- [ ] Large result sets paginate properly
- [ ] Filtering doesn't cause slowdown

---

## Security Tests

### Authentication
- [ ] Cannot bypass login with invalid token
- [ ] Cannot access admin endpoints without token
- [ ] Token expiration works (if implemented)

### Input Validation
- [ ] SQL injection attempt is blocked
- [ ] XSS attempt in text input is sanitized
- [ ] Large file uploads are rejected

### CORS
- [ ] Requests from allowed origins succeed
- [ ] Requests from disallowed origins are rejected

---

## Accessibility Tests (Optional)

- [ ] Forms are keyboard navigable
- [ ] Tab order is logical
- [ ] Form labels are associated with inputs
- [ ] Error messages are announced to screen readers
- [ ] Color contrast meets WCAG standards

---

## Bugs Found

Use this section to track any issues discovered during testing:

| Issue | Severity | Steps to Reproduce | Status |
|-------|----------|-------------------|--------|
|       |          |                   |        |
|       |          |                   |        |
|       |          |                   |        |

---

## Notes for Future Improvements

- [ ] Add unit tests for critical functions
- [ ] Add end-to-end tests
- [ ] Add performance benchmarks
- [ ] Add security testing
- [ ] Add accessibility testing
- [ ] Set up CI/CD pipeline

---

## Sign-off

- Testing Date: ________________
- Tested By: ________________
- All Critical Tests Passed: [ ] Yes [ ] No
- Ready for Development: [ ] Yes [ ] No
