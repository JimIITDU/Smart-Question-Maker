#!/usr/bin/env python
"""
Comprehensive test script for Question Download & Save features.
Tests all endpoints with/without Ollama.

Usage:
    python test_questions.py

Requirements:
    pip install requests
"""

import requests
import json
import time
import sys
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:8000/api"
TEST_USERNAME = "test_user_" + str(int(time.time()))
TEST_EMAIL = f"{TEST_USERNAME}@test.com"
TEST_PASSWORD = "TestPass123!@"

# Colors for output
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'

def print_header(text):
    print(f"\n{BLUE}{'='*60}")
    print(f"  {text}")
    print(f"{'='*60}{RESET}\n")

def print_success(text):
    print(f"{GREEN}✓ {text}{RESET}")

def print_error(text):
    print(f"{RED}✗ {text}{RESET}")

def print_info(text):
    print(f"{YELLOW}ℹ {text}{RESET}")

def print_test_result(name, passed, details=""):
    status = f"{GREEN}PASSED{RESET}" if passed else f"{RED}FAILED{RESET}"
    print(f"  {name}: {status}")
    if details:
        print(f"    {details}")

class QuestionTester:
    def __init__(self):
        self.token = None
        self.user_id = None
        self.document_id = None
        self.session_id = None
        self.headers = {}
        self.test_results = []

    def set_header(self):
        """Update headers with current token."""
        self.headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }

    def test_registration(self):
        """Test 1: User Registration"""
        print_header("TEST 1: User Registration")
        
        url = f"{BASE_URL}/users/register/"
        payload = {
            "username": TEST_USERNAME,
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
            "password2": TEST_PASSWORD
        }
        
        try:
            response = requests.post(url, json=payload)
            
            if response.status_code == 201:
                data = response.json()
                self.user_id = data.get('id')
                print_success(f"User registered successfully (ID: {self.user_id})")
                self.test_results.append(("Registration", True))
                return True
            else:
                print_error(f"Registration failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Registration", False))
                return False
        except Exception as e:
            print_error(f"Registration error: {str(e)}")
            self.test_results.append(("Registration", False))
            return False

    def test_login(self):
        """Test 2: User Login & Token Generation"""
        print_header("TEST 2: User Login & Token Generation")
        
        url = f"{BASE_URL}/token/"
        payload = {
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD
        }
        
        try:
            response = requests.post(url, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get('access')
                self.set_header()
                print_success(f"Login successful, token received")
                print_info(f"Token: {self.token[:20]}...")
                self.test_results.append(("Login", True))
                return True
            else:
                print_error(f"Login failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Login", False))
                return False
        except Exception as e:
            print_error(f"Login error: {str(e)}")
            self.test_results.append(("Login", False))
            return False

    def test_document_upload(self):
        """Test 3: Document Upload"""
        print_header("TEST 3: Document Upload")
        
        # Create test file
        test_file_path = Path("test_document.txt")
        test_content = """
        This is a test document for question generation.
        
        Chapter 1: Introduction to Machine Learning
        Machine Learning is a subset of Artificial Intelligence that focuses on 
        enabling computers to learn from data without explicit programming.
        
        Chapter 2: Types of Machine Learning
        There are three main types: Supervised Learning, Unsupervised Learning, 
        and Reinforcement Learning.
        
        Chapter 3: Supervised Learning
        In supervised learning, models are trained on labeled data where both input 
        and output are provided.
        
        Chapter 4: Applications
        Machine Learning has applications in image recognition, natural language 
        processing, recommendation systems, and many more fields.
        """
        
        try:
            # Write test file
            test_file_path.write_text(test_content)
            print_info(f"Created test file: {test_file_path}")
            
            # Upload file
            url = f"{BASE_URL}/documents/"
            with open(test_file_path, 'rb') as f:
                files = {'file': (test_file_path.name, f)}
                response = requests.post(url, headers={"Authorization": f"Bearer {self.token}"}, files=files)
            
            if response.status_code == 201:
                data = response.json()
                self.document_id = data.get('id')
                status = data.get('status')
                print_success(f"Document uploaded successfully (ID: {self.document_id})")
                print_info(f"Status: {status}")
                self.test_results.append(("Document Upload", True))
                
                # Cleanup
                test_file_path.unlink()
                return True
            else:
                print_error(f"Document upload failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Document Upload", False))
                test_file_path.unlink()
                return False
        except Exception as e:
            print_error(f"Document upload error: {str(e)}")
            self.test_results.append(("Document Upload", False))
            if test_file_path.exists():
                test_file_path.unlink()
            return False

    def test_generate_questions(self):
        """Test 4: Generate Questions (with Ollama detection)"""
        print_header("TEST 4: Generate Questions")
        
        url = f"{BASE_URL}/questions/sessions/generate/"
        payload = {
            "document_id": self.document_id,
            "num_mcq": 2,
            "num_short": 2,
            "difficulty": "medium"
        }
        
        try:
            response = requests.post(url, headers=self.headers, json=payload)
            
            if response.status_code == 201:
                data = response.json()
                self.session_id = data.get('id')
                total_qs = data.get('total_questions')
                print_success(f"Questions generated successfully!")
                print_info(f"Session ID: {self.session_id}")
                print_info(f"Total questions: {total_qs}")
                self.test_results.append(("Generate Questions", True))
                return True
            else:
                print_error(f"Generation failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Generate Questions", False))
                return False
        except Exception as e:
            print_error(f"Generation error: {str(e)}")
            self.test_results.append(("Generate Questions", False))
            return False

    def test_preview_questions(self):
        """Test 5: Preview Questions (without download)"""
        print_header("TEST 5: Preview Questions")
        
        url = f"{BASE_URL}/questions/sessions/{self.session_id}/preview/"
        
        try:
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                total = data.get('total_questions', 0)
                questions = data.get('questions', [])
                
                print_success(f"Preview retrieved successfully!")
                print_info(f"Total questions: {total}")
                
                if questions:
                    for i, q in enumerate(questions[:2], 1):
                        q_type = q.get('type', 'unknown')
                        q_text = q.get('question', '')[:50]
                        print_info(f"  Q{i} [{q_type}]: {q_text}...")
                
                self.test_results.append(("Preview Questions", True))
                return True
            else:
                print_error(f"Preview failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Preview Questions", False))
                return False
        except Exception as e:
            print_error(f"Preview error: {str(e)}")
            self.test_results.append(("Preview Questions", False))
            return False

    def test_save_session(self):
        """Test 6: Save Session (Mark as completed)"""
        print_header("TEST 6: Save Session")
        
        url = f"{BASE_URL}/questions/sessions/{self.session_id}/save/"
        
        try:
            response = requests.post(url, headers=self.headers)
            
            if response.status_code == 200:
                data = response.json()
                status_msg = data.get('status', '')
                print_success(f"Session saved successfully!")
                print_info(f"Status: {status_msg}")
                self.test_results.append(("Save Session", True))
                return True
            else:
                print_error(f"Save failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Save Session", False))
                return False
        except Exception as e:
            print_error(f"Save error: {str(e)}")
            self.test_results.append(("Save Session", False))
            return False

    def test_download_json(self):
        """Test 7: Download as JSON"""
        print_header("TEST 7: Download Questions (JSON)")
        
        url = f"{BASE_URL}/questions/sessions/{self.session_id}/download/?format=json"
        output_file = f"questions_session_{self.session_id}.json"
        
        try:
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                # Save file
                with open(output_file, 'wb') as f:
                    f.write(response.content)
                
                # Verify file
                file_path = Path(output_file)
                if file_path.exists():
                    file_size = file_path.stat().st_size
                    
                    # Try to parse JSON
                    with open(file_path, 'r') as f:
                        data = json.load(f)
                    
                    questions_count = len(data.get('questions', []))
                    print_success(f"JSON download successful!")
                    print_info(f"File: {output_file} ({file_size} bytes)")
                    print_info(f"Questions in file: {questions_count}")
                    self.test_results.append(("Download JSON", True))
                    return True
                else:
                    print_error(f"File not created")
                    self.test_results.append(("Download JSON", False))
                    return False
            else:
                print_error(f"Download failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Download JSON", False))
                return False
        except Exception as e:
            print_error(f"Download error: {str(e)}")
            self.test_results.append(("Download JSON", False))
            return False

    def test_download_csv(self):
        """Test 8: Download as CSV"""
        print_header("TEST 8: Download Questions (CSV)")
        
        url = f"{BASE_URL}/questions/sessions/{self.session_id}/download/?format=csv"
        output_file = f"questions_session_{self.session_id}.csv"
        
        try:
            response = requests.get(url, headers=self.headers)
            
            if response.status_code == 200:
                # Save file
                with open(output_file, 'wb') as f:
                    f.write(response.content)
                
                # Verify file
                file_path = Path(output_file)
                if file_path.exists():
                    file_size = file_path.stat().st_size
                    
                    # Read content
                    with open(file_path, 'r') as f:
                        content = f.read()
                    
                    lines = content.strip().split('\n')
                    header = lines[0] if lines else ""
                    row_count = len(lines) - 1  # Exclude header
                    
                    print_success(f"CSV download successful!")
                    print_info(f"File: {output_file} ({file_size} bytes)")
                    print_info(f"Header: {header[:60]}...")
                    print_info(f"Total rows (excluding header): {row_count}")
                    self.test_results.append(("Download CSV", True))
                    return True
                else:
                    print_error(f"File not created")
                    self.test_results.append(("Download CSV", False))
                    return False
            else:
                print_error(f"Download failed: {response.status_code}")
                print_info(f"Response: {response.text}")
                self.test_results.append(("Download CSV", False))
                return False
        except Exception as e:
            print_error(f"Download error: {str(e)}")
            self.test_results.append(("Download CSV", False))
            return False

    def test_check_ollama(self):
        """Check if Ollama is available"""
        print_header("OLLAMA STATUS CHECK")
        
        try:
            response = requests.get("http://localhost:11434/api/tags", timeout=2)
            if response.status_code == 200:
                print_success("Ollama is AVAILABLE")
                print_info("Questions using AI generation (optimal quality)")
                return True
        except:
            print_info("Ollama is NOT running")
            print_success("System using fallback generation (questions still work!)")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print_header("QUESTION DOWNLOAD & SAVE FEATURE TEST SUITE")
        
        # Check Ollama first
        self.test_check_ollama()
        
        # Run tests
        tests = [
            self.test_registration,
            self.test_login,
            self.test_document_upload,
            self.test_generate_questions,
            self.test_preview_questions,
            self.test_save_session,
            self.test_download_json,
            self.test_download_csv,
        ]
        
        for test in tests:
            try:
                test()
            except Exception as e:
                print_error(f"Unexpected error in {test.__name__}: {str(e)}")
            time.sleep(0.5)  # Small delay between tests
        
        # Print summary
        self.print_summary()

    def print_summary(self):
        """Print test summary"""
        print_header("TEST SUMMARY")
        
        passed = sum(1 for _, result in self.test_results if result)
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {GREEN}{passed}{RESET}")
        print(f"Failed: {RED}{total - passed}{RESET}")
        print()
        
        for test_name, result in self.test_results:
            status = f"{GREEN}✓{RESET}" if result else f"{RED}✗{RESET}"
            print(f"  {status} {test_name}")
        
        print()
        if passed == total:
            print(f"{GREEN}{'='*60}")
            print(f"  ALL TESTS PASSED! 🎉")
            print(f"{'='*60}{RESET}")
            return True
        else:
            print(f"{RED}{'='*60}")
            print(f"  SOME TESTS FAILED")
            print(f"{'='*60}{RESET}")
            return False

def main():
    """Main test runner"""
    print(f"""
{BLUE}
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║       Question Download & Save Features - Test Suite      ║
║                                                            ║
║   Tests: Registration, Login, Upload, Generate,            ║
║          Preview, Save, Download (JSON & CSV)             ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
{RESET}
    """)
    
    print_info(f"Base URL: {BASE_URL}")
    print_info(f"Test User: {TEST_USERNAME}")
    print()
    
    # Check if server is running
    try:
        requests.get(f"{BASE_URL}/users/", timeout=2)
    except:
        print_error("Django server is not running!")
        print_info("Start server with: python manage.py runserver")
        sys.exit(1)
    
    # Run tests
    tester = QuestionTester()
    success = tester.run_all_tests()
    
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()
