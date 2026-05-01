# Fix Plan: Replace Mock Questions with Real Gemini API

## Information Gathered

### Problem Identified
- **File**: `backend/services/llmService.js`
- **Function**: `generateQuestion()` calls `mockGenerateQuestion()` as fallback
- **Root Cause**: When `GEMINI_API_KEY` is missing or API fails, `mockGenerateQuestion()` returns hardcoded placeholder questions like:
  - `"Guided question #1: html"`
  - `"Concept A related to html"`
  - `"Concept B related to html"`

### Key Code Sections
1. **Line ~200**: `if (!model) { return llmService.mockGenerateQuestion(...) }`
2. **Line ~270**: Catch block falls back to mock: `return llmService.mockGenerateQuestion(mode, params)`
3. **Line ~300-400**: `mockGenerateQuestion()` contains hardcoded placeholder text

### Files to Modify
1. `backend/services/llmService.js` - Main fix (remove mock fallback, ensure real API calls)
2. No changes to auth, roleMiddleware, or tenantMiddleware

---

## Plan

### Step 1: Fix `generateQuestion()` in llmService.js
**Changes**:
- Add console.log at start to confirm API key presence and params
- Remove automatic fallback to `mockGenerateQuestion` when Gemini fails
- If Gemini fails, throw actual error instead of returning mock data
- Add safe JSON extraction with error handling

### Step 2: Fix `mockGenerateQuestion()` 
**Changes**:
- Either remove the function entirely OR
- Make it clearly marked as "UNAVAILABLE" and throw error if called

### Step 3: Verify Integration in questionController.js
- The existing code already calls `llmService.assQuestion()` correctly
- No changes needed there

---

## Implementation Details

### Code Changes to llmService.js

```javascript
// In generateQuestion() - Add logging at start:
console.log('[LLM] generateQuestion called');
console.log('[LLM] GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'EXISTS' : 'MISSING');
console.log('[LLM] Mode:', mode, '| Topic:', topic);

// Remove fallback - replace catch block:
} catch (error) {
  console.error('[LLM] Gemini generation error:', error.message);
  // REMOVED: return llmService.mockGenerateQuestion(mode, params);
  // NEW: Throw actual error
  throw new Error(`Gemini API failed: ${error.message}`);
}

// Remove all mock question generation calls
```

---

## Follow-up Steps After Edit
1. Test the `/api/questions/ai-generate` endpoint
2. Verify console logs show "GEMINI_API_KEY: EXISTS"
3. Check that real AI-generated questions are returned (not placeholder text)
