#!/usr/bin/env python3
"""
Test script to verify Ollama is working correctly
Run this before starting the backend server
"""

import ollama
import requests
import sys

def test_ollama_connection():
    """Test if Ollama service is running"""
    print("🔍 Testing Ollama connection...")
    
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        if response.status_code == 200:
            print("✅ Ollama service is running")
            models = response.json()
            print(f"📦 Available models: {models}")
            return True
        else:
            print(f"❌ Ollama returned status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to Ollama at http://localhost:11434")
        print("💡 Please start Ollama with: ollama serve")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_model_exists():
    """Check if llama3.2:3b model is installed"""
    print("\n🔍 Checking for llama3.2:3b model...")
    
    try:
        response = requests.get("http://localhost:11434/api/tags")
        if response.status_code == 200:
            data = response.json()
            models = data.get('models', [])
            
            model_names = [m.get('name', '') for m in models]
            
            if 'llama3.2:3b' in model_names or any('llama3.2' in name for name in model_names):
                print("✅ llama3.2:3b model is installed")
                return True
            else:
                print("❌ llama3.2:3b model not found")
                print("💡 Install it with: ollama pull llama3.2:3b")
                print(f"   Available models: {model_names}")
                return False
    except Exception as e:
        print(f"❌ Error checking models: {e}")
        return False

def test_summarization():
    """Test actual text summarization"""
    print("\n🔍 Testing summarization...")
    
    test_text = """
    The quick brown fox jumps over the lazy dog. This is a test sentence 
    to verify that Ollama can generate summaries. Machine learning models 
    are powerful tools for natural language processing tasks.
    """
    
    try:
        print("📝 Generating summary...")
        response = ollama.generate(
            model='llama3.2:3b',
            prompt=f"Summarize the following text in 2-3 sentences:\n\n{test_text}\n\nSummary:",
            options={
                'temperature': 0.7,
            }
        )
        
        if response and 'response' in response:
            summary = response['response']
            print("✅ Summarization successful!")
            print(f"\n📄 Summary:\n{summary}\n")
            return True
        else:
            print("❌ Ollama returned empty response")
            return False
            
    except Exception as e:
        print(f"❌ Summarization failed: {e}")
        return False

def main():
    """Run all tests"""
    print("=" * 60)
    print("🧪 DocuMind AI - Ollama Testing Suite")
    print("=" * 60)
    
    all_passed = True
    
    # Test 1: Connection
    if not test_ollama_connection():
        all_passed = False
        print("\n❌ CRITICAL: Cannot connect to Ollama service")
        print("   Start Ollama first with: ollama serve")
        sys.exit(1)
    
    # Test 2: Model exists
    if not test_model_exists():
        all_passed = False
        print("\n❌ CRITICAL: Model not installed")
        print("   Run: ollama pull llama3.2:3b")
        sys.exit(1)
    
    # Test 3: Actual summarization
    if not test_summarization():
        all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("✅ ALL TESTS PASSED! Your Ollama setup is ready.")
        print("   You can now start the backend server.")
    else:
        print("❌ SOME TESTS FAILED! Please fix the issues above.")
    print("=" * 60)
    
    sys.exit(0 if all_passed else 1)

if __name__ == "__main__":
    main()