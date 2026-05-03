# AI Generation Fix - Progress Tracker

## Plan Overview
Fix AI question generation failures due to missing GROQ_API_KEY, count mismatch, and UI tik icons.

## Steps (3/10 complete)

### 1. ✅ Backend: llmService graceful mock
### 2. ✅ Backend: controller exact typeCounts
### 3. ✅ Frontend: Remove preview ✓ icons

**User Feedback Fixes:**
### 4. [ ] Frontend: Type selector - conditional check icon if count>0
### 5. [ ] Frontend: Remove bottom "Number of questions" input

### 6. ✅ Frontend: Disable save during regenerate loading
### 7. ✅ Frontend: saveAccepted → bulkUpdateStatus (activate drafts, no duplicates)

### 8. [ ] Backend: Add question source="ai_generated" filter in getAllQuestions if needed
### 9. [ ] Test regenerate (only rejected), uneven counts, save to bank (status=active)
### 10.[ ] Polish + complete

**Next:** UI conditional icons + remove count input

**Next:** Step 1 - Update llmService.js

**Notes:** 
- User has GEMINI_KEY (for eval), needs GROQ_KEY for generation (console.groq.com/keys)
- Schema/DB supports all fields
- Focus: Backend first (core failure), then UI polish
