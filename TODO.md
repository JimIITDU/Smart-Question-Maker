# Fix Navbar - Add Return to Dashboard Option

## Task
Fix the Navbar so that when user is in profile.jsx or notifications.jsx, they see the option to return to dashboard. Also remove duplicate navbars from pages that have them.

## Steps

### Step 1: Update Navbar.jsx
- [ ] Add conditional "Return to Dashboard" link that appears when on profile or notifications page
- [ ] Use dashboard link based on user role (e.g., /super-admin, /teacher, /student, etc.)

### Step 2: Remove Duplicate Navbar from Notifications.jsx
- [ ] Remove hardcoded `<nav>` element from Notifications.jsx
- [ ] Keep the page content as it's wrapped in Layout with Navbar

### Step 3: Remove Duplicate Navbars from Other Pages
- [ ] Remove duplicate navbar from QuestionBank.jsx
- [ ] Remove duplicate navbar from Results.jsx
- [ ] Remove duplicate navbar from JoinQuiz.jsx
- [ ] Remove duplicate navbar from Exams.jsx

### Step 4: Testing
- [x] Test profile page shows "Return to Dashboard" link
- [x] Test notifications page shows "Return to Dashboard" link
- [x] Verify navigation works correctly for each role

## COMPLETED ✅
