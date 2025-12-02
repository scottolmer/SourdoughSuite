import React, { createContext, useState, useEffect, useContext } from 'react';
import { getCurrentUser, loginUser, registerUser, logoutUser, updateUserProfile } from '../api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define types for user data
export interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    hydrationPreference?: number;
    starterId?: number;
  };
}

interface LoginCredentials {
  username: string;
  password: string;
}

interface RegistrationData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isLoggedIn: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

// Create context with default values
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  error: null,
  isLoggedIn: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  clearError: () => {},
});

// User provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on app start
  useEffect(() => {
    const checkForUser = async () => {
      try {
        setIsLoading(true);
        // Try to get user data from storage first for immediate UI update
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
        
        // Then check if the session is still valid with the server
        const userData = await getCurrentUser();
        setUser(userData);
        await AsyncStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        // If there's an error (like expired session), clear local data
        setUser(null);
        await AsyncStorage.removeItem('user');
        console.log('Session expired or no active session');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkForUser();
  }, []);

  // Login function
  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await loginUser(credentials);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'Failed to login');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (data: RegistrationData) => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await registerUser(data);
      setUser(userData);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (err: any) {
      setError(err.message || 'Failed to register');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      await logoutUser();
      setUser(null);
      await AsyncStorage.removeItem('user');
    } catch (err: any) {
      setError(err.message || 'Failed to logout');
      // Even if the server logout fails, clear local state
      setUser(null);
      await AsyncStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedUser = await updateUserProfile(data);
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Create the value object with all the context data and functions
  const value = {
    user,
    isLoading,
    error,
    isLoggedIn: !!user,
    login,
    register,
    logout,
    updateProfile,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// Custom hook for using user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;