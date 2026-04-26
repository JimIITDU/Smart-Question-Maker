#!/usr/bin/env python
"""Quick API test to check registration and authentication"""
import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
TIMESTAMP = str(int(time.time() * 1000))

TEST_USER = {
    "username": f"test{TIMESTAMP}",
    "email": f"test{TIMESTAMP}@test.com",
    "password": "TestPass@123456",
    "password2": "TestPass@123456"
}

print("="*60)
print("Quick API Test - Registration and Token")
print("="*60)

# Test 1: Register
print("\n[1] Testing User Registration...")
print(f"User Data: {TEST_USER}")
response = requests.post(f"{BASE_URL}/users/register/", json=TEST_USER)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2) if response.status_code != 201 else 'User created'}")

# Test 2: Get Token
print("\n[2] Testing Token Endpoint...")
token_data = {
    "email": TEST_USER['email'],
    "password": TEST_USER['password']
}
print(f"Token Data: {token_data}")
response = requests.post(f"{BASE_URL}/token/", json=token_data)
print(f"Status: {response.status_code}")
try:
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    if response.status_code == 200:
        print(f"Access Token: {data['access'][:50]}...")
except:
    print(f"Response: {response.text[:200]}")

# Test 3: Try with username instead of email
print("\n[3] Testing Token with Username...")
token_data = {
    "username": TEST_USER['username'],
    "password": TEST_USER['password']
}
print(f"Token Data: {token_data}")
response = requests.post(f"{BASE_URL}/token/", json=token_data)
print(f"Status: {response.status_code}")
try:
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    if response.status_code == 200:
        print(f"Access Token: {data['access'][:50]}...")
except:
    print(f"Response: {response.text[:200]}")

# Test 4: List documents without auth
print("\n[4] Testing Documents Endpoint (No Auth)...")
response = requests.get(f"{BASE_URL}/documents/")
print(f"Status: {response.status_code}")
print(f"Expected 401 Unauthorized")
