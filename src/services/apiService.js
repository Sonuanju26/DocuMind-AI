import { API_ENDPOINTS } from '../config/api';

// Helper function to get auth token
const getAuthToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.token || null;
};

// Helper function to get user ID
const getUserId = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  return user.id || null;
};

// Auth API calls
export const signupWithEmail = async (name, email, password) => {
  const response = await fetch(API_ENDPOINTS.SIGNUP, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, auth_method: 'email' })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Signup failed');
  }
  
  return response.json();
};

export const loginWithEmail = async (email, password) => {
  const response = await fetch(API_ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }
  
  return response.json();
};

export const googleAuth = async (token, email, name, picture) => {
  const response = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, email, name, picture })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Google authentication failed');
  }
  
  return response.json();
};

export const setupOfflinePin = async (email, pin) => {
  const response = await fetch(API_ENDPOINTS.SETUP_OFFLINE_PIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to setup offline PIN');
  }
  
  return response.json();
};

export const offlineLogin = async (email, pin) => {
  const response = await fetch(API_ENDPOINTS.OFFLINE_LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, pin })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Invalid PIN');
  }
  
  return response.json();
};

// Summarization API with timeout and progress tracking
export const summarizeFiles = async (files, settings, timeoutMs = 180000) => { // 3 minute timeout
  const formData = new FormData();
  
  // Append files
  files.forEach(file => {
    formData.append('files', file);
  });
  
  // Append settings
  formData.append('settings_json', JSON.stringify(settings));
  
  // Append user ID
  const userId = getUserId();
  if (userId) {
    formData.append('user_id', userId);
  }
  
  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log('Starting summarization request...');
    console.log('Files:', files.map(f => f.name));
    console.log('Settings:', settings);
    
    const response = await fetch(API_ENDPOINTS.SUMMARIZE, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorDetail = 'Summarization failed';
      try {
        const error = await response.json();
        errorDetail = error.detail || errorDetail;
      } catch (e) {
        errorDetail = `Server error (${response.status})`;
      }
      throw new Error(errorDetail);
    }
    
    const result = await response.json();
    console.log('Summarization result:', result);
    
    return result;
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - the summarization is taking too long. Please try with a smaller file or shorter text.');
    }
    
    // Network errors
    if (error.message === 'Failed to fetch') {
      throw new Error('Cannot connect to server. Please ensure the backend is running on http://localhost:8000');
    }
    
    throw error;
  }
};

// Image Analysis API
export const analyzeImage = async (imageFile, generateStory = false, storyPrompt = null) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  formData.append('generate_story', generateStory);
  
  if (storyPrompt) {
    formData.append('story_prompt', storyPrompt);
  }
  
  const userId = getUserId();
  if (userId) {
    formData.append('user_id', userId);
  }
  
  const response = await fetch(API_ENDPOINTS.ANALYZE_IMAGE, {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Image analysis failed');
  }
  
  return response.json();
};