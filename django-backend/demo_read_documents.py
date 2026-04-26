#!/usr/bin/env python
"""
Quick Document Upload and Content Reading Demo - with timeout
"""
import requests
import json
import uuid
import sys

BASE_URL = "http://localhost:8000/api"
UNIQUE = uuid.uuid4().hex[:8]

# Set a 10 second timeout for all requests
timeout_secs = 10

# Step 1: Register
print("1. Registering user...")
try:
    user_email = f"demo{UNIQUE}@test.com"
    reg_resp = requests.post(f"{BASE_URL}/users/register/", json={
        "username": f"demo{UNIQUE}",
        "email": user_email,
        "password": "Demo@12345",
        "password2": "Demo@12345"
    }, headers={"Accept": "application/json"}, timeout=timeout_secs)
    print(f"   Status: {reg_resp.status_code}")
    if reg_resp.status_code != 201:
        print(f"   Error: {reg_resp.json()}")
        sys.exit(1)
except requests.exceptions.Timeout:
    print("   ERROR: Registration request timed out")
    sys.exit(1)
except Exception as e:
    print(f"   ERROR: {e}")
    sys.exit(1)

# Step 2: Get token
print("\n2. Getting JWT token...")
try:
    token_resp = requests.post(f"{BASE_URL}/token/", json={
        "email": user_email,
        "password": "Demo@12345"
    }, headers={"Accept": "application/json"}, timeout=timeout_secs)
    print(f"   Status: {token_resp.status_code}")
    if token_resp.status_code != 200:
        print(f"   Response: {token_resp.text[:200]}")
        sys.exit(1)
    
    access_token = token_resp.json()['access']
    print(f"   ✓ Token obtained")
except requests.exceptions.Timeout:
    print("   ERROR: Token request timed out")
    sys.exit(1)
except Exception as e:
    print(f"   ERROR: {e}")
    sys.exit(1)

# Step 3: Upload text file
print("\n3. Uploading text file...")
try:
    headers = {"Authorization": f"Bearer {access_token}"}
    with open("test_files/document.txt", 'rb') as f:
        files = {'file': ('test.txt', f)}
        print("   Sending file to server...")
        upload_resp = requests.post(f"{BASE_URL}/documents/", 
                                   headers=headers, 
                                   files=files,
                                   timeout=timeout_secs)
        
    print(f"   Status: {upload_resp.status_code}")
    if upload_resp.status_code == 201:
        doc_data = upload_resp.json()
        doc_id = doc_data['id']
        print(f"   ✓ Document created (ID: {doc_id})")
        print(f"   Processing Status: {doc_data.get('status')}")
        
        # Step 4: Get document details with extracted content
        print(f"\n4. Retrieving extracted content...")
        detail_resp = requests.get(f"{BASE_URL}/documents/{doc_id}/", 
                                  headers=headers,
                                  timeout=timeout_secs)
        if detail_resp.status_code == 200:
            doc = detail_resp.json()
            print(f"   File Type: {doc.get('file_type')}")
            print(f"   Status: {doc.get('status')}")
            
            extracted = doc.get('extracted_text', '')
            if extracted:
                print(f"\n   ✓ EXTRACTED CONTENT ({len(extracted)} characters):")
                print("   " + "="*70)
                lines = extracted.split('\n')[:15]  # Show first 15 lines
                for line in lines:
                    if line.strip():
                        print(f"   {line[:70]}")
                if len(extracted.split('\n')) > 15:
                    remaining = len(extracted.split('\n')) - 15
                    print(f"   ... ({remaining} more lines)")
                print("   " + "="*70)
            else:
                print(f"   Note: Content not yet extracted (Status: {doc.get('status')})")
                print(f"   If status is 'pending', Celery worker may not be running")
        else:
            print(f"   Error: {detail_resp.status_code}")
    else:
        print(f"   Error uploading: {upload_resp.status_code}")
        print(f"   Response: {upload_resp.text[:300]}")
except requests.exceptions.Timeout:
    print("   ERROR: Upload request timed out (10 seconds)")
    print("   This suggests the server may be hanging on multipart upload")
except Exception as e:
    print(f"   ERROR: {e}")
    import traceback
    traceback.print_exc()

print("\nTest complete!")
