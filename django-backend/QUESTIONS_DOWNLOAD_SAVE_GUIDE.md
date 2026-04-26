# Question Download & Save Features - Complete Guide

## ✅ What Was Fixed

### 1. **Ollama Connection Error** (ConnectionError)
- **Problem:** Crashed when Ollama LLM wasn't running on port 11434
- **Solution:** Made Ollama optional with automatic fallback questions
- **Result:** Questions generate even without Ollama!

### 2. **Download & Save Questions**
- **Added:** Download questions as JSON or CSV
- **Added:** Save/mark questions as completed
- **Added:** Preview questions without downloading
- **Result:** Users can save and export their questions!

---

## 🚀 How It Works Now

### Scenario 1: Ollama Running (Optimal)
```
User generates questions
    ↓
Ollama LLM creates questions
    ↓
High-quality AI questions ✓
```

### Scenario 2: Ollama Not Running (Fallback)
```
User generates questions
    ↓
Ollama unavailable? No problem!
    ↓
Auto-generate fallback questions ✓
    ↓
User can still download/save ✓
```

---

## 📚 API Endpoints

### Generate Questions (Auto-handles Ollama)
```
POST /api/questions/sessions/generate/
{
    "document_id": 1,
    "num_mcq": 5,
    "num_short": 3,
    "difficulty": "medium"
}
```

**Result:** Questions are generated (AI or fallback)

### Save Session
```
POST /api/questions/sessions/{id}/save/
```

**Response:**
```json
{
    "status": "Session marked as saved",
    "session_id": 1
}
```

### Download Questions (JSON)
```
GET /api/questions/sessions/{id}/download/?format=json
```

**Result:** JSON file with all questions downloaded

### Download Questions (CSV)
```
GET /api/questions/sessions/{id}/download/?format=csv
```

**Result:** CSV file with all questions for Excel/Sheets

### Preview Questions
```
GET /api/questions/sessions/{id}/preview/
```

**Response:** Preview questions without downloading

---

## 🔧 Complete Workflow Example

### 1. Register & Get Token
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@test.com",
    "password": "Pass123!",
    "password2": "Pass123!"
  }'

TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"Pass123!"}' | jq -r '.access')
```

### 2. Upload Document
```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"

# Get document ID from response
DOC_ID=1
```

### 3. Generate Questions (Auto-works even without Ollama!)
```bash
curl -X POST http://localhost:8000/api/questions/sessions/generate/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": '$DOC_ID',
    "num_mcq": 5,
    "num_short": 3,
    "difficulty": "medium"
  }'

# Get session ID from response
SESSION_ID=1
```

### 4. Preview Questions (Before Downloading)
```bash
curl -X GET http://localhost:8000/api/questions/sessions/$SESSION_ID/preview/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq .
```

### 5. Save Session (Mark as Completed)
```bash
curl -X POST http://localhost:8000/api/questions/sessions/$SESSION_ID/save/ \
  -H "Authorization: Bearer $TOKEN"
```

### 6. Download as JSON
```bash
curl -X GET http://localhost:8000/api/questions/sessions/$SESSION_ID/download/?format=json \
  -H "Authorization: Bearer $TOKEN" \
  > questions.json
```

### 7. Download as CSV
```bash
curl -X GET http://localhost:8000/api/questions/sessions/$SESSION_ID/download/?format=csv \
  -H "Authorization: Bearer $TOKEN" \
  > questions.csv

# Open in Excel/Google Sheets!
```

---

## 🐍 Python Example

```python
import requests
import json

BASE_URL = "http://localhost:8000/api"
TOKEN = "your_jwt_token"
headers = {"Authorization": f"Bearer {TOKEN}"}

# Generate questions
response = requests.post(f"{BASE_URL}/questions/sessions/generate/",
    headers=headers,
    json={
        "document_id": 1,
        "num_mcq": 5,
        "num_short": 3
    }
)

session_id = response.json()['id']
print(f"Session created: {session_id}")

# Preview questions
preview = requests.get(f"{BASE_URL}/questions/sessions/{session_id}/preview/",
    headers=headers
).json()

print(f"Total questions: {preview['total_questions']}")
for q in preview['questions']:
    print(f"- {q['type']}: {q['question'][:50]}...")

# Save session
requests.post(f"{BASE_URL}/questions/sessions/{session_id}/save/",
    headers=headers
)
print("Session saved!")

# Download as JSON
response = requests.get(
    f"{BASE_URL}/questions/sessions/{session_id}/download/?format=json",
    headers=headers
)

with open("questions.json", "wb") as f:
    f.write(response.content)

print("Questions downloaded as JSON!")

# Or download as CSV
response = requests.get(
    f"{BASE_URL}/questions/sessions/{session_id}/download/?format=csv",
    headers=headers
)

with open("questions.csv", "wb") as f:
    f.write(response.content)

print("Questions downloaded as CSV!")
```

---

## 📊 Database Storage

Questions are **automatically saved** in the database when generated:

### Database Structure
```
QuestionSession
├─ id
├─ user (Foreign Key)
├─ document (Foreign Key)
├─ total_questions
├─ completed (Boolean) ← Updated by /save/
├─ created_at

Question (One-to-many with Session)
├─ id
├─ session (Foreign Key)
├─ question_type (mcq, short, written)
├─ question_text
├─ options (JSON for MCQ)
├─ correct_answer
├─ model_answer
├─ explanation
├─ difficulty
├─ total_marks
├─ created_at
```

---

## 🎯 Question Types & Fallback Examples

### 1. MCQ (Multiple Choice)
**With Ollama:**
```json
{
  "question": "What is the main concept discussed?",
  "options": {"A": "Option 1", "B": "Option 2", "C": "Option 3", "D": "Option 4"},
  "correct_answer": "A",
  "explanation": "Detailed explanation..."
}
```

**Without Ollama (Fallback):**
```json
{
  "question": "What is the meaning of: 'XYZ from document'?",
  "options": {"A": "Definition from text", "B": "Alternative", "C": "Another", "D": "Different"},
  "correct_answer": "A",
  "explanation": "Based on the document: ..."
}
```

### 2. Short Answer
**With Ollama:** AI generates creative short answer prompts  
**Without Ollama:** Auto-generates summarization prompts from text

### 3. Written/Essay
**With Ollama:** AI generates analytical essay prompts  
**Without Ollama:** Auto-generates with rubric based on document sections

---

## 📥 Download Formats

### JSON Format
```json
{
  "session_id": 1,
  "document": "document_title.pdf",
  "created_at": "2026-04-21T06:00:00Z",
  "total_questions": 8,
  "completed": true,
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "...",
      "options": {...},
      "correct_answer": "A",
      "marks": 5
    },
    ...
  ]
}
```

**Use:** For importing into LMS, storing raw data, API integration

### CSV Format
| Question# | Type | Question | Difficulty | Marks | Options/Answer | Explanation |
|-----------|------|----------|------------|-------|---|---|
| 1 | mcq | What is... | medium | 5 | {"A":"...", "B":"..."} | Explanation here |
| 2 | short | Summarize... | medium | 5 | | |

**Use:** Import to Excel, Google Sheets, print paper tests

---

## 🚀 Ollama Setup (Optional but Recommended)

If you want to use Ollama for better AI-generated questions:

### Installation
```bash
# Download Ollama
# https://ollama.ai/download

# Pull a model
ollama pull mistral

# Start Ollama (in another terminal)
ollama serve
```

### Django Settings
Add to `.env`:
```
OLLAMA_BASE_URL=http://localhost:11434
LLM_MODEL=mistral
```

### Check Ollama Status
```bash
# Should respond with ollama running
curl http://localhost:11434/api/tags
```

---

## ✅ Testing the Fix

### Test 1: Without Ollama (Should Work!)
```bash
# Don't start Ollama
python manage.py runserver

# Generate questions - should use fallback
python test_integration.py
```

✅ **Expected:** Questions generated even without Ollama

### Test 2: With Ollama (Better Quality)
```bash
# Start Ollama first
ollama serve

# In another terminal
python manage.py runserver

# Generate questions - should use LLM
python test_integration.py
```

✅ **Expected:** High-quality AI questions from Ollama

### Test 3: Download/Save
```bash
# After generating questions
curl -X GET http://localhost:8000/api/questions/sessions/1/download/?format=json \
  -H "Authorization: Bearer $TOKEN" \
  > questions.json

# Check file exists
ls -la questions.json
```

✅ **Expected:** JSON file downloaded successfully

---

## 🔧 Troubleshooting

### Q: "ConnectionError" still appearing?
**A:** 
1. Make sure you're on latest code (pulled latest changes)
2. Restart Django: `python manage.py runserver`
3. Try generating questions again

### Q: Ollama won't connect?
**A:** That's OK! Questions will use fallback generation (still works)
```bash
# To use Ollama:
ollama serve  # Start in another terminal
```

### Q: Download returns empty file?
**A:** 
1. Make sure session exists and has questions
2. Check: `GET /api/questions/sessions/{id}/preview/`
3. Verify the session belongs to your user

### Q: Can't save session?
**A:**
1. Make sure session ID is correct
2. Make sure you own the session (you created it)
3. Check: `POST /api/questions/sessions/{id}/save/`

---

## 📚 New Database Fields

**Modified:** `QuestionSession` model
- Added: `completed` field (Boolean, default=False)
- Purpose: Track which sessions are saved/completed

**No new migrations needed!** The field was already there but not used.

---

## 🎉 Summary of Features

| Feature | Status | Notes |
|---------|--------|-------|
| Generate questions | ✅ Works always | Uses Ollama if available, fallback otherwise |
| Preview questions | ✅ Works always | See questions before downloading |
| Save session | ✅ Works always | Mark session as completed |
| Download JSON | ✅ Works always | For raw data/integration |
| Download CSV | ✅ Works always | For Excel/Sheets/printing |
| Ollama optional | ✅ Fixed | No crash if not running |
| Fallback questions | ✅ Added | Auto-generated from document |
| Database storage | ✅ Automatic | All questions stored in DB |

---

## 🚀 That's It!

Questions are now:
- ✅ Always generated (with or without Ollama)
- ✅ Automatically saved in database
- ✅ Downloadable as JSON or CSV
- ✅ Previewable before download
- ✅ Markable as saved/completed

**Everything works smoothly now!** 🎉
