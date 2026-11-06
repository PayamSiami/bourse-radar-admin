"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';


export interface User {
  id: number;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  verified: boolean;
}

const AuthContext = createContext<any>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const getHeaders = (): HeadersInit => {
    if (token) {
      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      };
    }
    return {
      'Content-Type': 'application/json',
    };
  };

  const headers = getHeaders();

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ورود ناموفق بود');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'ثبت‌نام ناموفق بود');
      }

      const data = await response.json();
      setToken(data.token);
      setUser(data.user);

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'تأیید ایمیل ناموفق بود');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
    } catch (error) {
      throw error;
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    if (!user) return;
    const newUser = { ...user, ...updatedUser };
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  return <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: token !== null && user !== null,
      isLoading,
      login,
      register,
      logout,
      verifyEmail,
      updateUser,
    }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
