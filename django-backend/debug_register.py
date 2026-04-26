#!/usr/bin/env python
"""Debug registration issue"""
import requests
import json
import uuid

BASE_URL = "http://localhost:8000/api"
UNIQUE_ID = uuid.uuid4().hex[:12]

TEST_USER = {
    "username": f"test{UNIQUE_ID}",
    "email": f"test{UNIQUE_ID}@test.com",
    "password": "SecurePass@123",
    "password2": "SecurePass@123"
}

print("TEST_USER data:")
print(json.dumps(TEST_USER, indent=2))
print()

session = requests.Session()
resp = session.post(
    f"{BASE_URL}/users/register/",
    json=TEST_USER,
    headers={"Accept": "application/json"}
)

print(f"Status: {resp.status_code}")
print(f"Response: {json.dumps(resp.json(), indent=2)}")
