import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export interface ApiResponse {
  success: boolean;
  data?: any;
  message?: string;
  error?: string;
}

export interface AuthState {
  user: any;
  token: string;
}

// Utility function to handle unauthorized token errors
export const handleUnauthorizedError = async (
  data: ApiResponse,
  setUser: (user: any) => void,
  setToken: (token: string | null) => void
): Promise<boolean> => {
  if (data.error === 'Unauthorized, Token Failed' || data.message === 'Unauthorized, Token Failed') {
    // Clear local storage and redirect to login
    await AsyncStorage.removeItem('authData');
    setUser(null);
    setToken(null);
    Alert.alert('Session Expired', 'Your session has expired. Please login again.');
    router.replace('/auth');
    return true; // Indicates unauthorized error was handled
  }
  return false; // No unauthorized error
};

// Utility function to make authenticated API calls
export const makeAuthenticatedApiCall = async (
  url: string,
  options: RequestInit,
  token: string,
  setUser: (user: any) => void,
  setToken: (token: string | null) => void
): Promise<ApiResponse> => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    let data: ApiResponse;
    
    try {
      data = await response.json();
    } catch (jsonError) {
      // Handle cases where server returns HTML instead of JSON
      if (jsonError instanceof SyntaxError && jsonError.message.includes('Unexpected token')) {
        return { 
          success: false, 
          error: 'Server is not responding correctly. Please try again later or contact support if the issue persists.' 
        };
      }
      throw jsonError;
    }
    
    // Check for unauthorized token error
    const isUnauthorized = await handleUnauthorizedError(data, setUser, setToken);
    if (isUnauthorized) {
      return { success: false, error: 'Unauthorized' };
    }
    
    return data;
  } catch (error) {
    console.error('API call error:', error);
    
    // Handle different types of network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      return { 
        success: false, 
        error: 'Network error: Unable to connect to server. Please check your internet connection.' 
      };
    } else if (error instanceof DOMException && error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Request timeout: The server is taking too long to respond. Please try again.' 
      };
    } else if (error instanceof SyntaxError && error.message.includes('Unexpected token')) {
      return { 
        success: false, 
        error: 'Server response error: Invalid data format received from server.' 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.' 
    };
  }
};
