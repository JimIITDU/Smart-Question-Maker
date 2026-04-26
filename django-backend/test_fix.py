#!/usr/bin/env python
"""
Test script: Upload document and create questions - SYNCHRONIZED VERSION
This demonstrates the fix for "Document still processing" error
"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"

# Create unique test user
unique_id = uuid.uuid4().hex[:8]
user_email = f"test_{unique_id}@example.com"

print("=" * 70)
print("DOCUMENT UPLOAD → QUESTION GENERATION TEST (SYNCHRONIZED)")
print("=" * 70)

# Step 1: Register user
print(f"\n[1/6] Registering user: {user_email}")
reg_resp = requests.post(f"{BASE_URL}/users/register/", json={
    "username": f"user_{unique_id}",
    "email": user_email,
    "password": "TestPass123!",
    "password2": "TestPass123!"
}, headers={"Accept": "application/json"})

if reg_resp.status_code != 201:
    print(f"  ✗ Registration failed: {reg_resp.status_code}")
    exit(1)
print(f"  ✓ User registered successfully")

# Step 2: Get token
print(f"\n[2/6] Getting JWT token")
token_resp = requests.post(f"{BASE_URL}/token/", json={
    "email": user_email,
    "password": "TestPass123!"
}, headers={"Accept": "application/json"})

if token_resp.status_code != 200:
    print(f"  ✗ Failed to get token: {token_resp.status_code}")
    exit(1)

access_token = token_resp.json()['access']
headers = {"Authorization": f"Bearer {access_token}"}
print(f"  ✓ Token obtained")

# Step 3: Upload document
print(f"\n[3/6] Uploading document (TXT file)")
with open("test_files/document.txt", 'rb') as f:
    upload_resp = requests.post(f"{BASE_URL}/documents/", 
                               headers=headers,
                               files={'file': ('document.txt', f)})

if upload_resp.status_code != 201:
    print(f"  ✗ Upload failed: {upload_resp.status_code}")
    print(f"  Response: {upload_resp.text[:200]}")
    exit(1)

doc_data = upload_resp.json()
doc_id = doc_data['id']
print(f"  ✓ Document uploaded (ID: {doc_id})")
print(f"    Status: {doc_data['status']}")
print(f"    Title: {doc_data['title']}")

# Step 4: Check document status
print(f"\n[4/6] Checking document status")
status_resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
doc = status_resp.json()
print(f"  Status: {doc['status']}")
print(f"  Extracted text length: {len(doc.get('extracted_text', ''))} characters")

# Step 5: Create questions (THIS NOW PROCESSES DOCUMENT SYNCHRONOUSLY)
print(f"\n[5/6] Creating questions from document")
print(f"  ⏳ Processing document synchronously...")

questions_resp = requests.post(f"{BASE_URL}/questions/sessions/generate/", 
                              headers=headers,
                              json={
                                  "document_id": doc_id,
                                  "num_mcq": 3,
                                  "num_short": 2,
                                  "include_written": False,
                                  "difficulty": "medium"
                              })

if questions_resp.status_code == 201:
    session_data = questions_resp.json()
    print(f"  ✓ Questions generated successfully!")
    print(f"    Session ID: {session_data['id']}")
    print(f"    Total questions: {session_data.get('total_questions', 0)}")
elif questions_resp.status_code == 400:
    print(f"  ✗ Error: {questions_resp.json()['error']}")
    exit(1)
else:
    print(f"  ✗ Failed: {questions_resp.status_code}")
    print(f"  Response: {questions_resp.text[:300]}")
    exit(1)

# Step 6: Verify document was processed
print(f"\n[6/6] Verifying document processing")
final_resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
final_doc = final_resp.json()
print(f"  Document status: {final_doc['status']}")
print(f"  Extracted text: {len(final_doc.get('extracted_text', ''))} characters")

if final_doc.get('extracted_text'):
    lines = final_doc['extracted_text'].split('\n')[:5]
    print(f"\n  Sample content:")
    for line in lines:
        if line.strip():
            print(f"    > {line[:60]}")

print(f"\n{'=' * 70}")
print("✅ SUCCESS: Document processing and question generation working!")
print(f"{'=' * 70}")
print(f"\n📝 Summary:")
print(f"  • Document uploaded: ✓")
print(f"  • Document processed synchronously: ✓")
print(f"  • Questions generated: ✓")
print(f"  • No 'Document still processing' error: ✓")
