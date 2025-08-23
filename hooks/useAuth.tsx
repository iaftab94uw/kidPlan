import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_CONFIG } from '@/config/api';

interface User {
  _id: string;
  fullName: string;
  profilePhoto: string | null;
  email: string;
  password: string;
  role: string;
  birthdate: string | null;
  address: string | null;
  isEmailVerified: boolean;
  fcmTokens: string[];
  createdAt: string;
  updatedAt: string;
  isRequestedResetPassword: boolean;
  __v: number;
}

interface AuthData {
  user: User;
  token: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (fullName: string, email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  const isAuthenticated = !!user && !!token;

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.LOGIN}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log(data)
      if (data.success && data.data) {
        const authData: AuthData = {
          user: data.data.user,
          token: data.data.token,
        };

        await AsyncStorage.setItem('authData', JSON.stringify(authData));
        
        setUser(authData.user);
        setToken(authData.token);
        setHasCheckedAuth(false); // Reset auth check flag

        router.replace('/(tabs)');
        return true;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.SIGNUP}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ fullName, email, password }),
      });

      const data = await response.json();
      console.log('Signup response:', data);
      
      if (data.success && data.data) {
        const authData: AuthData = {
          user: data.data.user,
          token: data.data.token,
        };

        await AsyncStorage.setItem('authData', JSON.stringify(authData));
        
        setUser(authData.user);
        setToken(authData.token);
        setHasCheckedAuth(false); // Reset auth check flag

        router.replace('/(tabs)');
        return true;
      } else {
        throw new Error(data.message || 'Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.PREFIX}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`, {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      console.log('Forgot password response:', data);
      
      if (data.success) {
        return true;
      } else {
        throw new Error(data.message || 'Password reset failed');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem('authData');
      setUser(null);
      setToken(null);
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const checkAuthStatus = async (): Promise<void> => {
    // Prevent multiple auth checks
    if (hasCheckedAuth) {
      console.log('Auth already checked, skipping...');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Checking auth status...');
      
      const authDataString = await AsyncStorage.getItem('authData');
      console.log('Auth data from storage:', authDataString ? 'exists' : 'not found');
      
      if (authDataString) {
        const authData: AuthData = JSON.parse(authDataString);
        
        if (authData.token && authData.user) {
          console.log('Valid auth data found, setting user and token');
          setUser(authData.user);
          setToken(authData.token);
          console.log('Redirecting to tabs...');
          router.replace('/(tabs)');
        } else {
          console.log('Invalid auth data, clearing storage');
          await AsyncStorage.removeItem('authData');
          console.log('Redirecting to auth...');
          router.replace('/auth');
        }
      } else {
        console.log('No auth data found, redirecting to auth...');
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('authData');
      console.log('Error occurred, redirecting to auth...');
      router.replace('/auth');
    } finally {
      setIsLoading(false);
      setHasCheckedAuth(true);
      console.log('Auth check completed, isLoading set to false');
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAuthenticated,
    login,
    signup,
    forgotPassword,
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
