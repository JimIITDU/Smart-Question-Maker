# Fix Exams and Notifications Loading Issues

## Phase 1: Fix Backend SQL Queries
- [x] `backend/models/examModel.js` - Add JOINs for subject_name, batch_name
- [x] `backend/controllers/examController.js` - Add error logging, fix createExam

## Phase 2: Fix Frontend Error Handling
- [x] `frontend/src/pages/Student/Exams.jsx` - Add console.error logging
- [x] `frontend/src/pages/Notifications.jsx` - Add console.error logging

## Phase 3: Fix Notification Controller
- [x] `backend/controllers/notificationController.js` - Add error logging

## Summary of Changes

### `backend/models/examModel.js`
- Added LEFT JOINs to `subjects` and `batch` tables in:
  - `getAllExams()` 
  - `getAllExamsForStudent()`
  - `getExamById()`
  - `getExamByAccessCode()`
- Now returns `subject_name` and `batch_name` alongside exam data

### `backend/controllers/examController.js`
- Added `console.error()` in ALL catch blocks for better debugging
- Fixed `createExam` to accept and pass `title` and `duration_minutes` from request body
- Auto-generates title if not provided: `Exam ${subject_id || 'N/A'}`
- Defaults duration to 60 minutes if not provided

### `backend/controllers/notificationController.js`
- Added `console.error()` in ALL catch blocks for better debugging

### `frontend/src/pages/Student/Exams.jsx`
- Added `console.error()` in `fetchExams`, `fetchQuestions`, `handleSubmit`, `handleStartExam` catch blocks

### `frontend/src/pages/Notifications.jsx`
- Added `console.error()` in `fetchNotifications` catch block
