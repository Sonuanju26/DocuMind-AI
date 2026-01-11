// API Configuration
const API_BASE_URL = 'http://localhost:8000';

export const API_ENDPOINTS = {
  // Auth endpoints
  SIGNUP: `${API_BASE_URL}/auth/signup`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GOOGLE_AUTH: `${API_BASE_URL}/auth/google-auth`,
  SETUP_OFFLINE_PIN: `${API_BASE_URL}/auth/setup-offline-pin`,
  OFFLINE_LOGIN: `${API_BASE_URL}/auth/offline-login`,
  
  // Summarization
  SUMMARIZE: `${API_BASE_URL}/summarize/summarize`,
  
  // Image analysis
  ANALYZE_IMAGE: `${API_BASE_URL}/image/analyze-image`,
};

export default API_BASE_URL;