# API Endpoints Reference (Generic ViewSets)

All views have been refactored to use Django REST Framework's **Generic Views** and **ViewSets** for cleaner, more maintainable code.

---

## 📋 User Management

### Register User
```http
POST /api/users/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "StrongPass123!",
  "password2": "StrongPass123!"
}
```
Response: `201 Created`
```json
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2026-04-21T10:30:00Z"
}
```

### Get/Update User Profile
```http
GET /api/users/profile/
Authorization: Bearer {access_token}
```

```http
PUT /api/users/profile/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe"
}
```

---

## 📄 Document Management

### Create/Upload Document
```http
POST /api/documents/
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

file: <binary_file>
```
Response: `201 Created`

### List User Documents
```http
GET /api/documents/
Authorization: Bearer {access_token}
```

### Get Document Details
```http
GET /api/documents/{id}/
Authorization: Bearer {access_token}
```

### Get Document Status
```http
GET /api/documents/{id}/status/
Authorization: Bearer {access_token}
```

### Delete Document
```http
DELETE /api/documents/{id}/
Authorization: Bearer {access_token}
```

---

## ❓ Question Management

### Generate Questions from Document
```http
POST /api/questions/sessions/generate/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "document_id": 1,
  "include_mcq": true,
  "num_mcq": 5,
  "include_short": true,
  "num_short": 5,
  "include_written": false,
  "num_written": 2,
  "difficulty": "medium"
}
```
Response: `201 Created`
```json
{
  "id": 1,
  "user": 1,
  "document": 1,
  "created_at": "2026-04-21T10:30:00Z",
  "total_questions": 10,
  "completed": false,
  "questions": [...]
}
```

### List Question Sessions
```http
GET /api/questions/sessions/
Authorization: Bearer {access_token}
```

### Get Session Details
```http
GET /api/questions/sessions/{id}/
Authorization: Bearer {access_token}
```

### List All Questions
```http
GET /api/questions/
Authorization: Bearer {access_token}
```

### Get Question Details
```http
GET /api/questions/{id}/
Authorization: Bearer {access_token}
```

---

## ✅ Answer Evaluation

### Submit Answer for Evaluation
```http
POST /api/evaluation/answers/
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "question_id": 1,
  "answer_text": "Your answer here",
  "selected_option": "A"  // For MCQ only
}
```
Response: `201 Created`
```json
{
  "id": 1,
  "user": 1,
  "question": 1,
  "answer_text": "Your answer here",
  "score_percentage": 85.5,
  "marks_obtained": 8.55,
  "grade": "A",
  "llm_feedback": {...},
  "rule_feedback": {...},
  "created_at": "2026-04-21T10:30:00Z"
}
```

### List User Answers
```http
GET /api/evaluation/answers/
Authorization: Bearer {access_token}
```

### Get Answer Details
```http
GET /api/evaluation/answers/{id}/
Authorization: Bearer {access_token}
```

### Get Session Results
```http
GET /api/evaluation/answers/session_results/?session_id=1
Authorization: Bearer {access_token}
```
Response:
```json
{
  "session_id": 1,
  "overall_score": 82.5,
  "grade": "A",
  "total_questions": 10,
  "marks_obtained": 82.5,
  "total_marks": 100,
  "breakdown": {
    "accuracy": 25.0,
    "completeness": 23.5,
    "clarity": 20.0,
    "application": 14.0
  },
  "answers": [...]
}
```

---

## 🔐 Authentication

### Obtain JWT Token
```http
POST /api/token/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "StrongPass123!"
}
```
Response: `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Refresh Token
```http
POST /api/token/refresh/
Content-Type: application/json

{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```
Response: `200 OK`
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

---

## 📊 Key Benefits of Generic ViewSets

✅ **Reduced Code**: Less boilerplate, more functionality  
✅ **Consistency**: All views follow same patterns  
✅ **Built-in Actions**: Automatic list, create, retrieve, update, delete  
✅ **Custom Actions**: Easy to add custom endpoints via `@action` decorator  
✅ **Better Error Handling**: Consistent error responses  
✅ **Pagination**: Automatic pagination support  
✅ **Filtering**: Built-in filtering capabilities  
✅ **Permissions**: Unified permission handling  

---

## 🔄 ViewSet Endpoints Auto-Generated

Each ViewSet automatically generates these endpoints:

```
GET    /api/resource/              → list()
POST   /api/resource/              → create()
GET    /api/resource/{id}/         → retrieve()
PUT    /api/resource/{id}/         → update()
PATCH  /api/resource/{id}/         → partial_update()
DELETE /api/resource/{id}/         → destroy()
GET    /api/resource/{action}/     → custom @action endpoints
```

---

## 📝 Request/Response Format

All requests and responses use JSON format with standard HTTP status codes:

- **200 OK**: Successful GET request
- **201 Created**: Successful POST (resource created)
- **204 No Content**: Successful DELETE
- **400 Bad Request**: Invalid data
- **401 Unauthorized**: Missing/invalid authentication
- **403 Forbidden**: Permission denied
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error
