# API Reference - Complete Endpoint Documentation

## 📋 Table of Contents
1. [Authentication](#authentication)
2. [Documents](#documents)
3. [Questions - Generate](#questions---generate)
4. [Questions - Manage](#questions---manage)
5. [Questions - Export](#questions---export)

---

## Authentication

### Register User
**POST** `/api/users/register/`

Creates new user account
```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "Pass123!@",
    "password2": "Pass123!@"
  }'
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "username": "john",
  "email": "john@example.com"
}
```

---

### Get JWT Token
**POST** `/api/token/`

Login and receive JWT token for authentication
```bash
curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass123!@"
  }'
```

**Response:** `200 OK`
```json
{
  "access": "eyJhbGc...",  # Use this in Authorization header
  "refresh": "eyJhbGc..."
}
```

**Using token:**
```bash
curl -X GET http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer eyJhbGc..."
```

---

## Documents

### Upload Document
**POST** `/api/documents/`

Upload PDF, DOCX, TXT, PNG, JPG, or other supported file types
```bash
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@my_document.pdf"
```

**Supported Files:**
- `.txt` - Plain text
- `.pdf` - PDF (PyPDF)
- `.docx` - Word documents (python-docx)
- `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.tiff` - Images (OCR with Tesseract)

**Response:** `201 Created`
```json
{
  "id": 1,
  "title": "my_document.pdf",
  "file": "/media/documents/my_document.pdf",
  "status": "pending",
  "extracted_text": "Document content here...",
  "file_type": "pdf",
  "upload_date": "2026-04-21T12:00:00Z"
}
```

**Status:** 
- `pending` - Just uploaded, ready to process
- `processing` - Currently extracting text
- `completed` - Text extracted, ready for questions
- `failed` - Error during processing

---

## Questions - Generate

### Generate Questions from Document
**POST** `/api/questions/sessions/generate/`

Creates question session and generates questions from document
```bash
curl -X POST http://localhost:8000/api/questions/sessions/generate/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "document_id": 1,
    "num_mcq": 5,
    "num_short": 3,
    "num_written": 2,
    "difficulty": "medium"
  }'
```

**Request Fields:**
| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `document_id` | integer | ✅ Yes | - | ID of document to use |
| `num_mcq` | integer | ❌ No | 5 | Number of MCQ questions |
| `num_short` | integer | ❌ No | 3 | Number of short answer questions |
| `num_written` | integer | ❌ No | 0 | Number of written/essay questions |
| `difficulty` | string | ❌ No | medium | easy, medium, hard |

**Response:** `201 Created`
```json
{
  "id": 1,
  "document": 1,
  "user": 1,
  "total_questions": 10,
  "completed": false,
  "created_at": "2026-04-21T12:00:00Z",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "What is...",
      "options": {"A": "Option 1", "B": "Option 2"},
      "correct_answer": "A",
      "explanation": "Explanation here...",
      "difficulty": "medium",
      "total_marks": 5
    }
  ]
}
```

**Notes:**
- ✅ Works with or without Ollama running
- ✅ All questions saved to database automatically

---

## Questions - Manage

### Preview Questions
**GET** `/api/questions/sessions/{id}/preview/`

View questions without downloading file
```bash
curl -X GET http://localhost:8000/api/questions/sessions/1/preview/ \
  -H "Authorization: Bearer $TOKEN"
```

---

### Save Session
**POST** `/api/questions/sessions/{id}/save/`

Mark session as saved/completed
```bash
curl -X POST http://localhost:8000/api/questions/sessions/1/save/ \
  -H "Authorization: Bearer $TOKEN"
```

**Response:** `200 OK`
```json
{
  "status": "Session marked as saved",
  "session_id": 1
}
```

---

## Questions - Export

### Download Questions (JSON)
**GET** `/api/questions/sessions/{id}/download/?format=json`

Download all questions as JSON file
```bash
curl -X GET http://localhost:8000/api/questions/sessions/1/download/?format=json \
  -H "Authorization: Bearer $TOKEN" \
  > questions.json
```

---

### Download Questions (CSV)
**GET** `/api/questions/sessions/{id}/download/?format=csv`

Download all questions as CSV file
```bash
curl -X GET http://localhost:8000/api/questions/sessions/1/download/?format=csv \
  -H "Authorization: Bearer $TOKEN" \
  > questions.csv
```

**CSV Format:**
```
Question#,Type,Question,Difficulty,Marks,Options/Answer,Explanation
1,mcq,What is...?,medium,5,{...},...
2,short,Summarize...,medium,3,Sample answer...,
```

---

## Complete Workflow

```bash
# 1. Register & Login
TOKEN=$(curl -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"Pass123!"}' \
  | jq -r '.access')

# 2. Upload document
curl -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@document.pdf"

# 3. Generate questions (auto-works even without Ollama!)
curl -X POST http://localhost:8000/api/questions/sessions/generate/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"document_id": 1, "num_mcq": 5, "num_short": 3}'

# 4. Preview
curl -X GET http://localhost:8000/api/questions/sessions/1/preview/ \
  -H "Authorization: Bearer $TOKEN"

# 5. Save
curl -X POST http://localhost:8000/api/questions/sessions/1/save/ \
  -H "Authorization: Bearer $TOKEN"

# 6. Download
curl -X GET http://localhost:8000/api/questions/sessions/1/download/?format=json \
  -H "Authorization: Bearer $TOKEN" > questions.json
```

**See `QUESTIONS_DOWNLOAD_SAVE_GUIDE.md` for complete documentation!**
