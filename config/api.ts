// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://familymanagement-staging.up.railway.app', // Replace with your actual API base URL
  PREFIX: '/api/v1', // Replace with your actual API prefix
  ENDPOINTS: {
    LOGIN: '/users/login',
    SIGNUP: '/users/signUp',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    USER_PROFILE: '/users/profile',
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (token: string) => {
  return {
    ...API_CONFIG.HEADERS,
    'Authorization': `Bearer ${token}`,
  };
};
