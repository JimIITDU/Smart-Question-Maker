# Edit Plan: llmService.js

## Information Gathered
From `backend/services/llmService.js`:

1. **`generateQuestion` function** (lines ~195-320):
   - Has artificial delay at line ~203: `await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 15000));`
   - Catch block (lines ~296-299) currently returns `mockGenerateQuestion` fallback instead of throwing error
   - No logging before `model.generateContent(prompt)` call
   - Guided prompt uses `topic` directly which only contains the word (e.g., "html")

2. **`mockGenerateQuestion` function**: Exists but should ONLY be called from `evaluateWrittenAnswer` fallback

3. **`evaluateWrittenAnswer` function** already has proper fallback pattern - keep it

## Plan

### Step 1: Remove artificial delay in `generateQuestion`
- Remove line: `await new Promise(resolve => setTimeout(resolve, 15000 + Math.random() * 15000));`

### Step 2: Add logging before and after `generateContent` call
- Add `console.log('[LLM] Sending prompt to Gemini. Length:', prompt.length, 'chars');` before `model.generateContent(prompt)`
- Add `console.log('[LLM] Gemini responded successfully');` after response is received

### Step 3: Fix catch block in `generateQuestion`
Change:
```javascript
} catch (error) {
  console.error('[LLM] Gemini generation error:', error.message);
  // Fallback to mock generation
  return llmService.mockGenerateQuestion(mode, params);
}
```
To:
```javascript
} catch (error) {
  console.error('[LLM] Gemini generation error:', error.message);
  throw new Error(`Gemini API failed: ${error.message}`);
}
```

### Step 4: Update guided prompt to use more context
Update the guided case to use subject_id and hints as PRIMARY context:
```javascript
case 'guided':
  prompt = `
Generate ${count} ${question_type.toUpperCase()} questions about the topic: "${topic}"
Subject context: ${subject_id}
Teacher's hints and content: "${hints}"

Use the teacher's hints as the PRIMARY source of question content.
Generate questions STRICTLY based on the provided hints/content.
...
```

### Step 5: Verify mockGenerateQuestion is NOT called from generateQuestion
- Confirm the only call to `mockGenerateQuestion` is in `evaluateWrittenAnswer` catch block (which is correct)

## Dependent Files
- `backend/services/llmService.js` - only file to modify

## Followup Steps
- Restart the backend server to test changes
