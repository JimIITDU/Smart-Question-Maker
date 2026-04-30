# Auto-Login After OTP Verification

## Plan
Modify registration flow so after OTP verification, user is automatically logged in and redirected to dashboard instead of login page.

## Tasks
- [x] Step 1: Modify backend `authController.js` — `verifyOTP` endpoint to generate JWT token and return user data
- [x] Step 2: Modify frontend `VerifyOTP.jsx` — use token from response, redirect to `/dashboard`

## Files to Edit
1. `backend/controllers/authController.js`
2. `frontend/src/pages/Auth/VerifyOTP.jsx`
