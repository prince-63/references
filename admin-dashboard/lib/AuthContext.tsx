'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from 'react';
import { logger } from './logger';
import { handleApiError } from './errorHandler';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  showToast?: (type: 'success' | 'error', message: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const hydrationDone = useRef(false);

  useEffect(() => {
    if (!hydrationDone.current) {
      hydrationDone.current = true;
      const authStatus = localStorage.getItem('isAuthenticated');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsAuthenticated(authStatus === 'true');
      setIsLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      logger.info('Login attempt started', { username });

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const error = (await response.json()) as Record<string, unknown>;
        logger.warn('Login failed', { username, status: response.status });

        if (
          typeof window !== 'undefined' &&
          (
            window as unknown as Record<
              string,
              (arg0: string, arg1: string, arg2: string) => void
            >
          ).__showToast
        ) {
          (
            window as unknown as Record<
              string,
              (arg0: string, arg1: string, arg2: string) => void
            >
          ).__showToast(
            'error',
            'Invalid username or password',
            'Please check your credentials and try again.'
          );
        }
        return false;
      }

      const result = (await response.json()) as Record<string, unknown>;

      if (result.success) {
        logger.info('Login successful', { username });
        setIsAuthenticated(true);
        localStorage.setItem('isAuthenticated', 'true');

        if (
          typeof window !== 'undefined' &&
          (
            window as unknown as Record<
              string,
              (arg0: string, arg1: string, arg2: string) => void
            >
          ).__showToast
        ) {
          (
            window as unknown as Record<
              string,
              (arg0: string, arg1: string, arg2: string) => void
            >
          ).__showToast(
            'success',
            'Welcome back!',
            'Successfully logged in to the dashboard.'
          );
        }
        return true;
      }

      logger.warn('Login failed - invalid credentials', { username });
      if (
        typeof window !== 'undefined' &&
        (
          window as unknown as Record<
            string,
            (arg0: string, arg1: string, arg2: string) => void
          >
        ).__showToast
      ) {
        (
          window as unknown as Record<
            string,
            (arg0: string, arg1: string, arg2: string) => void
          >
        ).__showToast(
          'error',
          'Invalid username or password',
          'Please check your credentials and try again.'
        );
      }
      return false;
    } catch (error) {
      const apiError = handleApiError(error, 'Login');
      logger.error('Login error', { username }, error as Error);

      if (
        typeof window !== 'undefined' &&
        (
          window as unknown as Record<
            string,
            (arg0: string, arg1: string, arg2: string) => void
          >
        ).__showToast
      ) {
        (
          window as unknown as Record<
            string,
            (arg0: string, arg1: string, arg2: string) => void
          >
        ).__showToast('error', 'Login failed', apiError.userMessage);
      }
      return false;
    }
  };

  const logout = () => {
    logger.info('User logged out');
    setIsAuthenticated(false);
    localStorage.removeItem('isAuthenticated');

    if (
      typeof window !== 'undefined' &&
      (
        window as unknown as Record<
          string,
          (arg0: string, arg1: string, arg2: string) => void
        >
      ).__showToast
    ) {
      (
        window as unknown as Record<
          string,
          (arg0: string, arg1: string, arg2: string) => void
        >
      ).__showToast(
        'info',
        'Logged out',
        'You have been successfully logged out.'
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
