#!/usr/bin/env python
"""
Demonstrate document reading - Synchronous test
Shows how to upload a document and read its extracted content
"""
import requests
import time
import uuid
import os

BASE_URL = "http://localhost:8000/api"

# Create a simple test document
test_file = "test_files/document.txt"

# Create unique user
unique_id = uuid.uuid4().hex[:6]
user_data = {
    "username": f"user_{unique_id}",
    "email": f"user_{unique_id}@test.com",
    "password": "SecurePass123!",
    "password2": "SecurePass123!"
}

print("=" * 70)
print("DOCUMENT UPLOAD & READING DEMONSTRATION")
print("=" * 70)

# Step 1: User Registration
print("\n[Step 1] User Registration")
print(f"  Creating user: {user_data['email']}")
resp = requests.post(f"{BASE_URL}/users/register/", json=user_data, 
                     headers={"Accept": "application/json"})
if resp.status_code != 201:
    print(f"  ❌ Registration failed: {resp.status_code}")
    exit(1)
print(f"  ✓ User registered successfully")

# Step 2: Get JWT Token
print("\n[Step 2] JWT Authentication")
token_data = {"email": user_data['email'], "password": user_data['password']}
resp = requests.post(f"{BASE_URL}/token/", json=token_data,
                     headers={"Accept": "application/json"})
if resp.status_code != 200:
    print(f"  ❌ Token retrieval failed: {resp.status_code}")
    exit(1)
token = resp.json()['access']
print(f"  ✓ Authentication successful")
headers = {"Authorization": f"Bearer {token}"}

# Step 3: Upload Document
print("\n[Step 3] Document Upload")
print(f"  Uploading: {test_file}")
with open(test_file, 'rb') as f:
    try:
        upload_resp = requests.post(
            f"{BASE_URL}/documents/",
            headers=headers,
            files={'file': ('document.txt', f)},
            timeout=15
        )
    except requests.exceptions.Timeout:
        print(f"  ⏱  Upload timed out (server may be processing)")
        exit(1)

if upload_resp.status_code != 201:
    print(f"  ❌ Upload failed: {upload_resp.status_code}")
    print(f"  Response: {upload_resp.text[:200]}")
    exit(1)

doc_id = upload_resp.json()['id']
print(f"  ✓ Document uploaded (ID: {doc_id})")

# Step 4: Wait for processing
print("\n[Step 4] Processing Status")
for attempt in range(5):
    resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
    doc = resp.json()
    status = doc.get('status')
    print(f"  Attempt {attempt+1}: Status = {status}")
    
    if status == 'completed':
        print(f"  ✓ Processing complete")
        break
    elif status == 'failed':
        print(f"  ❌ Processing failed")
        print(f"  Error: {doc.get('extracted_text')}")
        exit(1)
    
    time.sleep(1)

# Step 5: Display Extracted Content
print("\n[Step 5] Display Extracted Content")
resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", headers=headers)
doc = resp.json()

print(f"  File Type: {doc['file_type']}")
print(f"  Status: {doc['status']}")

extracted_text = doc.get('extracted_text', '')
if extracted_text:
    print(f"\n  ✓ EXTRACTED TEXT ({len(extracted_text)} characters):\n")
    print("  " + "="*68)
    # Show first 30 lines or 1000 characters, whichever is less
    lines = extracted_text.split('\n')[:30]
    for line in lines:
        if len(line) > 68:
            print(f"  {line[:68]}...")
        else:
            print(f"  {line}")
    
    if len(extracted_text.split('\n')) > 30:
        print(f"  ... ({len(extracted_text.split('\n')) - 30} more lines)")
    print("  " + "="*68)
    
    print(f"\n✅ SUCCESS: Document content successfully extracted and returned!")
else:
    print(f"  ❌ No content extracted")

print("\n" + "="*70)
print("DEMONSTRATION COMPLETE")
print("="*70)
