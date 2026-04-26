# Document Upload & Reading API - Complete Guide

## Overview
The API now supports uploading multiple file types (PDF, DOCX, images, text) with automatic text extraction. Users can upload documents and retrieve the extracted text content.

## Supported File Types

| Format | Extension | Extraction Method | Notes |
|--------|-----------|-------------------|-------|
| Text | `.txt` | UTF-8 parsing | Plain text content |
| DOCX | `.docx` | python-docx | Word documents |
| PDF | `.pdf` | pypdf | All pages extracted |
| PNG | `.png` | Tesseract OCR | Optical character recognition |
| JPG/JPEG | `.jpg`, `.jpeg` | Tesseract OCR | Optical character recognition |
| GIF | `.gif` | Tesseract OCR | Optical character recognition |
| BMP | `.bmp` | Tesseract OCR | Optical character recognition |
| TIFF | `.tiff` | Tesseract OCR | Optical character recognition |

## Architecture

### 1. Document Model (`apps/documents/models.py`)
```python
class Document(models.Model):
    user = ForeignKey(AUTH_USER_MODEL, on_delete=CASCADE)
    file = FileField(upload_to='documents/%Y/%m/')
    file_type = CharField(max_length=20)  # e.g., 'pdf', 'docx', 'txt', 'png'
    title = CharField(max_length=255)
    extracted_text = TextField()  # Populated after async processing
    status = CharField(
        max_length=20,
        choices=[
            ('pending', 'Pending'),
            ('processing', 'Processing'),
            ('completed', 'Completed'),
            ('failed', 'Failed')
        ]
    )
    vector_store_id = CharField(max_length=255, blank=True)
    page_count = IntegerField(null=True)
    created_at = DateTimeField(auto_now_add=True)
```

### 2. Text Extraction (`apps/documents/processors.py`)

**DocumentProcessor class provides:**

- `extract_text_from_pdf(file_path)` → (text, page_count)
  - Uses pypdf library
  - Returns extracted text and total page count

- `extract_text_from_docx(file_path)` → text
  - Uses python-docx library
  - Extracts all paragraphs and tables

- `extract_text_from_txt(file_path)` → text
  - UTF-8 decoding
  - Direct text reading

- `extract_text_from_image(file_path)` → text
  - Uses Tesseract OCR via pytesseract
  - Supports PNG, JPG, JPEG, GIF, BMP, TIFF

- `process_document(document)` → extracted_text
  - Main processing method
  - Updates document status: pending → processing → completed/failed
  - Handles all file types automatically

- `create_vector_store(doc_id, text)` → store_path
  - Creates FAISS index from extracted text
  - Chunks text using RecursiveCharacterTextSplitter
  - Stores in `vector_stores/{doc_id}/`

### 3. Async Processing (`tasks/document_tasks.py`)

```python
@shared_task
def process_document_task(document_id):
    # Retrieves document from database
    # Extracts text using DocumentProcessor
    # Updates extracted_text field
    # Creates vector store index
    # Updates status to 'completed' or 'failed'
```

## API Endpoints

### 1. Upload Document
**POST** `/api/documents/`

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request:**
```
File: (form field 'file', any supported type)
```

**Response (201 Created):**
```json
{
    "id": 1,
    "file": "/media/documents/2025/01/sample.pdf",
    "title": "sample",
    "file_type": "pdf",
    "status": "pending",
    "extracted_text": "",
    "page_count": null,
    "vector_store_id": "",
    "created_at": "2025-01-22T10:30:00Z"
}
```

**Status Transitions:**
- `pending` → Document queued for processing
- `processing` → Celery worker is extracting text
- `completed` → Text extraction successful
- `failed` → Error during extraction

### 2. List User's Documents
**GET** `/api/documents/`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
[
    {
        "id": 1,
        "title": "sample",
        "file_type": "pdf",
        "status": "completed",
        "extracted_text": "PDF content here...",
        "page_count": 5,
        "created_at": "2025-01-22T10:30:00Z"
    },
    {
        "id": 2,
        "title": "document",
        "file_type": "docx",
        "status": "completed",
        "extracted_text": "Word doc content...",
        "created_at": "2025-01-22T10:35:00Z"
    }
]
```

### 3. Get Document Details (Read Content)
**GET** `/api/documents/{id}/`

**Headers:**
```
Authorization: Bearer {access_token}
```

**Response (200 OK):**
```json
{
    "id": 1,
    "title": "sample",
    "file_type": "pdf",
    "status": "completed",
    "extracted_text": "Page 1: Introduction...\nPage 2: Content...",
    "page_count": 5,
    "created_at": "2025-01-22T10:30:00Z"
}
```

### 4. Check Processing Status
**GET** `/api/documents/{id}/status/`

**Response (200 OK):**
```json
{
    "id": 1,
    "status": "processing",
    "extracted_text_length": 0,
    "message": "Document is being processed..."
}
```

### 5. Delete Document
**DELETE** `/api/documents/{id}/`

**Response (204 No Content)**

## Usage Examples

### Python Example - Upload and Read PDF
```python
import requests
import time

BASE_URL = "http://localhost:8000/api"

# 1. Register user
user_data = {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
}
requests.post(f"{BASE_URL}/users/register/", json=user_data)

# 2. Get JWT token
token_resp = requests.post(f"{BASE_URL}/token/", json={
    "email": "john@example.com",
    "password": "SecurePass123!"
})
access_token = token_resp.json()['access']

# 3. Upload PDF
headers = {"Authorization": f"Bearer {access_token}"}
with open("document.pdf", 'rb') as f:
    upload_resp = requests.post(
        f"{BASE_URL}/documents/",
        headers=headers,
        files={'file': ('document.pdf', f)}
    )
doc_id = upload_resp.json()['id']

# 4. Wait for processing
for attempt in range(10):
    doc_resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
    status = doc_resp.json()['status']
    if status == 'completed':
        break
    time.sleep(1)

# 5. Get extracted text
doc = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers).json()
extracted_text = doc['extracted_text']
print(f"PDF Content:\n{extracted_text}")
print(f"Total Pages: {doc['page_count']}")
```

### cURL Example - Upload Image and Read OCR Text
```bash
# 1. Get token
TOKEN=$(curl -s -X POST http://localhost:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"SecurePass123!"}' \
  | jq -r '.access')

# 2. Upload image
DOC_ID=$(curl -s -X POST http://localhost:8000/api/documents/ \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@screenshot.png" \
  | jq -r '.id')

# 3. Wait and retrieve extracted text
sleep 2
curl -s -X GET http://localhost:8000/api/documents/$DOC_ID/ \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.extracted_text'
```

## Data Flow

```
User Upload
    ↓
POST /api/documents/ (multipart form)
    ↓
DocumentViewSet.perform_create()
    ├─ Extract file extension → file_type
    ├─ Set title from filename
    ├─ Set status = 'pending'
    └─ Trigger async task
    ↓
process_document_task (Celery)
    ├─ Change status to 'processing'
    ├─ Detect file type
    ├─ Call DocumentProcessor
    │   ├─ PDF → extract_text_from_pdf()
    │   ├─ DOCX → extract_text_from_docx()
    │   ├─ TXT → extract_text_from_txt()
    │   └─ Image → extract_text_from_image()
    ├─ Update document.extracted_text
    ├─ Change status to 'completed'
    └─ Create vector store (FAISS)
    ↓
GET /api/documents/{id}/
    └─ Returns document with extracted_text field
```

## Processing Requirements

**To enable document processing, you must:**

1. **Install Tesseract OCR** (for image processing)
   - Windows: Download from https://github.com/UB-Mannheim/tesseract/wiki
   - Linux: `apt-get install tesseract-ocr`
   - macOS: `brew install tesseract`

2. **Start Celery Worker** (for async processing)
   ```bash
   celery -A tasks worker -l info
   ```

3. **Ensure Redis is Running** (Celery broker)
   ```bash
   redis-server
   ```

## Error Handling

If document processing fails:
- Status is set to `'failed'`
- `extracted_text` contains the error message
- Document is still accessible via API
- Error is logged for debugging

Example failed response:
```json
{
    "id": 5,
    "status": "failed",
    "extracted_text": "Error: pytesseract.TesseractNotFoundError: tesseract is not installed on this system"
}
```

## Vector Store

After text extraction, FAISS indexes are created for semantic search:
- Location: `vector_stores/{document_id}/`
- Supports: Similarity search, semantic retrieval
- Uses: HuggingFace Sentence Transformers (all-MiniLM-L6-v2)

## Performance Notes

- **Text files**: < 1 second
- **DOCX files**: < 2 seconds
- **PDF files**: 1-5 seconds (depends on page count)
- **Images**: 2-10 seconds (OCR processing)

Large documents (>100MB) may timeout. Use chunking for production.

## Security

- All endpoints require JWT authentication
- Users can only access their own documents
- Files stored in `media/documents/{year}/{month}/`
- Original files preserved in upload directory
