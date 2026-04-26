#!/usr/bin/env python
"""Direct API test without requests library"""
import json
import urllib.request
import urllib.error
import uuid

BASE_URL = "http://localhost:8000/api"
UNIQUE_ID = uuid.uuid4().hex[:12]

user_data = {
    "username": f"test{UNIQUE_ID}",
    "email": f"test{UNIQUE_ID}@test.com",
    "password": "TestPass@12345",
    "password2": "TestPass@12345"
}

print(f"Registering user: {user_data['email']}")
print()

# Register
url = f"{BASE_URL}/users/register/"
req = urllib.request.Request(
    url,
    data=json.dumps(user_data).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        result = json.loads(response.read())
        print(f"Response: {json.dumps(result, indent=2)}")
        user_id = result.get('id')
        print(f"\nUser created with ID: {user_id}")
except urllib.error.HTTPError as e:
    print(f"Error Status: {e.code}")
    try:
        error_body = e.read().decode()
        # Try to parse JSON
        try:
            error_data = json.loads(error_body)
            print(f"Error: {json.dumps(error_data, indent=2)}")
        except:
            # If not JSON, show first 500 chars
            print(f"Response: {error_body[:500]}")
    except:
        print("Could not read error response")
