# Profile Save Server Error Fix

## Issue
Profile save fails with server error because `date_of_birth` empty string `""` is sent to PostgreSQL DATE column, which only accepts `NULL` or valid dates.

## Steps
- [ ] Fix `frontend/src/pages/Profile.jsx` — format date for input, convert empty string to null before sending
- [ ] Fix `backend/controllers/authController.js` — sanitize empty `date_of_birth` to `null`

## Root Cause
- `Profile.jsx` initializes `date_of_birth: user?.date_of_birth || ''` → empty string on submit → PostgreSQL rejects `""` for DATE type.
- API date strings (e.g. `"2024-01-15T00:00:00.000Z"`) are also not formatted to `"YYYY-MM-DD"` for HTML date input.
