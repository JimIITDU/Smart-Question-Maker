# AI Generation Fix - Progress Tracker

## Plan Overview
Fix AI question generation failures due to missing GROQ_API_KEY, count mismatch, and UI tik icons.

## Steps (0/7 complete)

### 1. ✅ Backend: Make llmService.generateQuestion graceful (no throw on missing key)
### 2. ✅ Backend: questionController use frontend type_counts for exact per-type generation
### 3. ✅ Frontend: Remove ✓ icons from answer preview in AIQuestionGenerator
### 4. [ ] Backend: Add payload logging + better validation/error messages
### 5. [ ] Check/install groq-sdk dependency
### 6. [ ] Test: Generate with uneven counts (mcq:3, descriptive:7), verify exact output
### 7. [ ] Restart backend, full manual test UI → API → DB

**Next:** Step 1 - Update llmService.js

**Notes:** 
- User has GEMINI_KEY (for eval), needs GROQ_KEY for generation (console.groq.com/keys)
- Schema/DB supports all fields
- Focus: Backend first (core failure), then UI polish
