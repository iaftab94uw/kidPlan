// API Configuration
export const API_CONFIG = {
  BASE_URL: 'https://familymanagement-staging.up.railway.app', // Replace with your actual API base URL
  PREFIX: '/api/v1', // Replace with your actual API prefix
  ENDPOINTS: {
    LOGIN: '/users/login',
    SIGNUP: '/users/signUp',
    FORGOT_PASSWORD: '/users/initiateResetPassword',
    DELETE_ACCOUNT: '/users/deleteAccount',
    LOGOUT: '/users/logout',
    REFRESH_TOKEN: '/users/refresh-token',
    USER_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/updateUserProfile',
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
