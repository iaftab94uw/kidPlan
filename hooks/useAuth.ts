import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  email: string;
  role: string;
  birthdate: string;
  address: string;
  isEmailVerified: boolean;
  fcmTokens: string[];
  createdAt: string;
  updatedAt: string;
  isRequestedResetPassword: boolean;
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

  const isAuthenticated = !!user && !!token;

  const API_BASE_URL = 'https://your-api-domain.com';
  const API_PREFIX = '/api/v1';

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const authData: AuthData = {
          user: data.data.user,
          token: data.data.token,
        };

        await AsyncStorage.setItem('authData', JSON.stringify(authData));
        
        setUser(authData.user);
        setToken(authData.token);

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
    try {
      setIsLoading(true);
      
      const authDataString = await AsyncStorage.getItem('authData');
      
      if (authDataString) {
        const authData: AuthData = JSON.parse(authDataString);
        
        if (authData.token && authData.user) {
          setUser(authData.user);
          setToken(authData.token);
          router.replace('/(tabs)');
        } else {
          await AsyncStorage.removeItem('authData');
          router.replace('/auth');
        }
      } else {
        router.replace('/auth');
      }
    } catch (error) {
      console.error('Auth check error:', error);
      await AsyncStorage.removeItem('authData');
      router.replace('/auth');
    } finally {
      setIsLoading(false);
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
    logout,
    checkAuthStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
