#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Visibee E-Wardrobe Application
Tests all CRUD operations, AI integration, search functionality, and error handling
"""

import requests
import json
import base64
import uuid
from datetime import datetime
from typing import Dict, Any, List
import os
import sys

# Test Configuration
BASE_URL = "https://smart-wardrobe-22.preview.emergentagent.com/api"
TIMEOUT = 30  # seconds

# Sample base64 image data (small PNG image for testing)
SAMPLE_IMAGE_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

class VisibeeAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.session = requests.Session()
        self.test_results = []
        self.created_items = []  # Track created items for cleanup
        
    def log_test(self, test_name: str, success: bool, message: str, details: Dict = None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_api_health(self):
        """Test basic API health check"""
        try:
            response = self.session.get(f"{self.base_url}/", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Visibee" in data["message"]:
                    self.log_test("API Health Check", True, "API is running and responding correctly")
                    return True
                else:
                    self.log_test("API Health Check", False, "API response format incorrect", {"response": data})
                    return False
            else:
                self.log_test("API Health Check", False, f"API returned status {response.status_code}", 
                            {"status_code": response.status_code, "response": response.text})
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("API Health Check", False, f"Connection error: {str(e)}")
            return False
    
    def test_get_all_clothing_empty(self):
        """Test getting all clothing items when database is empty"""
        try:
            response = self.session.get(f"{self.base_url}/clothing", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Get All Clothing (Empty)", True, f"Retrieved {len(data)} clothing items")
                    return True
                else:
                    self.log_test("Get All Clothing (Empty)", False, "Response is not a list", {"response": data})
                    return False
            else:
                self.log_test("Get All Clothing (Empty)", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get All Clothing (Empty)", False, f"Request error: {str(e)}")
            return False
    
    def test_create_clothing_item(self):
        """Test creating a new clothing item"""
        try:
            test_item = {
                "name": "Blue Denim Jacket",
                "brand": "Levi's",
                "color": "Blue",
                "function": "casual",
                "purchase_date": "2024-01-15T10:30:00",
                "purchase_link": "https://example.com/jacket",
                "image_base64": SAMPLE_IMAGE_BASE64,
                "tags": ["denim", "casual", "outerwear"]
            }
            
            response = self.session.post(f"{self.base_url}/clothing", 
                                       json=test_item, timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "name", "brand", "color", "created_at"]
                
                if all(field in data for field in required_fields):
                    self.created_items.append(data["id"])
                    self.log_test("Create Clothing Item", True, f"Created item with ID: {data['id']}")
                    return data
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_test("Create Clothing Item", False, f"Missing fields: {missing_fields}", 
                                {"response": data})
                    return None
            else:
                self.log_test("Create Clothing Item", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Create Clothing Item", False, f"Request error: {str(e)}")
            return None
    
    def test_get_clothing_item(self, item_id: str):
        """Test getting a specific clothing item"""
        try:
            response = self.session.get(f"{self.base_url}/clothing/{item_id}", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("id") == item_id:
                    self.log_test("Get Specific Clothing Item", True, f"Retrieved item: {data['name']}")
                    return data
                else:
                    self.log_test("Get Specific Clothing Item", False, "Item ID mismatch", 
                                {"expected": item_id, "received": data.get("id")})
                    return None
            elif response.status_code == 404:
                self.log_test("Get Specific Clothing Item", False, "Item not found (404)", 
                            {"item_id": item_id})
                return None
            else:
                self.log_test("Get Specific Clothing Item", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Get Specific Clothing Item", False, f"Request error: {str(e)}")
            return None
    
    def test_update_clothing_item(self, item_id: str):
        """Test updating a clothing item"""
        try:
            update_data = {
                "name": "Updated Blue Denim Jacket",
                "color": "Dark Blue",
                "tags": ["denim", "casual", "outerwear", "updated"]
            }
            
            response = self.session.put(f"{self.base_url}/clothing/{item_id}", 
                                      json=update_data, timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if (data.get("name") == update_data["name"] and 
                    data.get("color") == update_data["color"]):
                    self.log_test("Update Clothing Item", True, f"Updated item: {data['name']}")
                    return data
                else:
                    self.log_test("Update Clothing Item", False, "Update data not reflected", 
                                {"expected": update_data, "received": data})
                    return None
            elif response.status_code == 404:
                self.log_test("Update Clothing Item", False, "Item not found (404)", 
                            {"item_id": item_id})
                return None
            else:
                self.log_test("Update Clothing Item", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("Update Clothing Item", False, f"Request error: {str(e)}")
            return None
    
    def test_ai_analysis(self):
        """Test AI analysis endpoint with Gemini integration"""
        try:
            analysis_request = {
                "image_base64": SAMPLE_IMAGE_BASE64,
                "analysis_type": "description"
            }
            
            response = self.session.post(f"{self.base_url}/ai/analyze", 
                                       json=analysis_request, timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["analysis_type", "result"]
                
                if all(field in data for field in required_fields):
                    if data["analysis_type"] == "description" and data["result"]:
                        self.log_test("AI Analysis", True, f"AI analysis completed: {data['result'][:50]}...")
                        return data
                    else:
                        self.log_test("AI Analysis", False, "Invalid analysis response", {"response": data})
                        return None
                else:
                    missing_fields = [f for f in required_fields if f not in data]
                    self.log_test("AI Analysis", False, f"Missing fields: {missing_fields}", 
                                {"response": data})
                    return None
            else:
                self.log_test("AI Analysis", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return None
                
        except requests.exceptions.RequestException as e:
            self.log_test("AI Analysis", False, f"Request error: {str(e)}")
            return None
    
    def test_search_functionality(self):
        """Test search endpoint with various queries"""
        try:
            # Test basic text search
            search_request = {
                "query": "blue",
                "filters": {}
            }
            
            response = self.session.post(f"{self.base_url}/search", 
                                       json=search_request, timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Search Functionality", True, f"Search returned {len(data)} results")
                    
                    # Test search with filters
                    filtered_search = {
                        "query": "jacket",
                        "filters": {"function": "casual"}
                    }
                    
                    filter_response = self.session.post(f"{self.base_url}/search", 
                                                      json=filtered_search, timeout=TIMEOUT)
                    
                    if filter_response.status_code == 200:
                        filter_data = filter_response.json()
                        self.log_test("Search with Filters", True, f"Filtered search returned {len(filter_data)} results")
                        return True
                    else:
                        self.log_test("Search with Filters", False, f"Status code: {filter_response.status_code}")
                        return False
                else:
                    self.log_test("Search Functionality", False, "Response is not a list", {"response": data})
                    return False
            else:
                self.log_test("Search Functionality", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Search Functionality", False, f"Request error: {str(e)}")
            return False
    
    def test_error_scenarios(self):
        """Test various error scenarios"""
        error_tests_passed = 0
        total_error_tests = 4
        
        # Test 1: Get non-existent item
        try:
            fake_id = str(uuid.uuid4())
            response = self.session.get(f"{self.base_url}/clothing/{fake_id}", timeout=TIMEOUT)
            if response.status_code == 404:
                self.log_test("Error: Get Non-existent Item", True, "Correctly returned 404")
                error_tests_passed += 1
            else:
                self.log_test("Error: Get Non-existent Item", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error: Get Non-existent Item", False, f"Exception: {str(e)}")
        
        # Test 2: Create item with invalid data
        try:
            invalid_item = {"invalid_field": "test"}  # Missing required 'name' field
            response = self.session.post(f"{self.base_url}/clothing", json=invalid_item, timeout=TIMEOUT)
            if response.status_code in [400, 422]:  # Bad request or validation error
                self.log_test("Error: Invalid Data Creation", True, f"Correctly rejected invalid data ({response.status_code})")
                error_tests_passed += 1
            else:
                self.log_test("Error: Invalid Data Creation", False, f"Expected 400/422, got {response.status_code}")
        except Exception as e:
            self.log_test("Error: Invalid Data Creation", False, f"Exception: {str(e)}")
        
        # Test 3: Update non-existent item
        try:
            fake_id = str(uuid.uuid4())
            update_data = {"name": "Updated Name"}
            response = self.session.put(f"{self.base_url}/clothing/{fake_id}", json=update_data, timeout=TIMEOUT)
            if response.status_code == 404:
                self.log_test("Error: Update Non-existent Item", True, "Correctly returned 404")
                error_tests_passed += 1
            else:
                self.log_test("Error: Update Non-existent Item", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error: Update Non-existent Item", False, f"Exception: {str(e)}")
        
        # Test 4: Delete non-existent item
        try:
            fake_id = str(uuid.uuid4())
            response = self.session.delete(f"{self.base_url}/clothing/{fake_id}", timeout=TIMEOUT)
            if response.status_code == 404:
                self.log_test("Error: Delete Non-existent Item", True, "Correctly returned 404")
                error_tests_passed += 1
            else:
                self.log_test("Error: Delete Non-existent Item", False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_test("Error: Delete Non-existent Item", False, f"Exception: {str(e)}")
        
        return error_tests_passed == total_error_tests
    
    def test_delete_clothing_item(self, item_id: str):
        """Test deleting a clothing item"""
        try:
            response = self.session.delete(f"{self.base_url}/clothing/{item_id}", timeout=TIMEOUT)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "deleted" in data["message"].lower():
                    self.log_test("Delete Clothing Item", True, f"Successfully deleted item {item_id}")
                    return True
                else:
                    self.log_test("Delete Clothing Item", False, "Unexpected response format", {"response": data})
                    return False
            elif response.status_code == 404:
                self.log_test("Delete Clothing Item", False, "Item not found (404)", {"item_id": item_id})
                return False
            else:
                self.log_test("Delete Clothing Item", False, f"Status code: {response.status_code}", 
                            {"response": response.text})
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("Delete Clothing Item", False, f"Request error: {str(e)}")
            return False
    
    def cleanup_created_items(self):
        """Clean up any items created during testing"""
        for item_id in self.created_items:
            try:
                self.session.delete(f"{self.base_url}/clothing/{item_id}", timeout=TIMEOUT)
            except:
                pass  # Ignore cleanup errors
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print("=" * 60)
        print("VISIBEE BACKEND API COMPREHENSIVE TEST SUITE")
        print("=" * 60)
        print(f"Testing API at: {self.base_url}")
        print()
        
        # Test 1: API Health Check
        if not self.test_api_health():
            print("\n❌ API is not responding. Stopping tests.")
            return self.generate_summary()
        
        # Test 2: Get all clothing (empty state)
        self.test_get_all_clothing_empty()
        
        # Test 3: Create clothing item
        created_item = self.test_create_clothing_item()
        
        if created_item:
            item_id = created_item["id"]
            
            # Test 4: Get specific clothing item
            self.test_get_clothing_item(item_id)
            
            # Test 5: Update clothing item
            self.test_update_clothing_item(item_id)
            
            # Test 6: Get all clothing (with data)
            response = self.session.get(f"{self.base_url}/clothing", timeout=TIMEOUT)
            if response.status_code == 200:
                data = response.json()
                self.log_test("Get All Clothing (With Data)", True, f"Retrieved {len(data)} clothing items")
            
            # Test 7: Delete clothing item
            self.test_delete_clothing_item(item_id)
        
        # Test 8: AI Analysis
        self.test_ai_analysis()
        
        # Test 9: Search functionality
        self.test_search_functionality()
        
        # Test 10: Error scenarios
        self.test_error_scenarios()
        
        # Cleanup
        self.cleanup_created_items()
        
        return self.generate_summary()
    
    def generate_summary(self):
        """Generate test summary"""
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%" if total_tests > 0 else "0%")
        
        if failed_tests > 0:
            print("\nFAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        
        return {
            "total": total_tests,
            "passed": passed_tests,
            "failed": failed_tests,
            "success_rate": (passed_tests/total_tests)*100 if total_tests > 0 else 0,
            "results": self.test_results
        }

def main():
    """Main test execution"""
    tester = VisibeeAPITester()
    summary = tester.run_all_tests()
    
    # Return appropriate exit code
    if summary["failed"] == 0:
        print("🎉 All tests passed!")
        sys.exit(0)
    else:
        print(f"⚠️  {summary['failed']} test(s) failed.")
        sys.exit(1)

if __name__ == "__main__":
    main()