import React, { createContext, useContext, useEffect, useState } from 'react';
import { safeFetch } from '../lib/api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credential: string, psw: string) => Promise<void>;
  register: (username: string, email: string, psw: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (credential: string) => Promise<any>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await safeFetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!error && data?.user) {
        setUser(data.user);
      } else if (error) {
        console.warn('Falha na autenticação automática:', error);
        localStorage.removeItem('token');
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (credential: string, psw: string) => {
    const { data, error } = await safeFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ credential, password: psw })
    });

    if (error) throw new Error(error);
    
    if (data.token) {
      localStorage.setItem('token', data.token);
      setUser(data.user);
    }
  };

  const register = async (username: string, email: string, psw: string) => {
    const { error } = await safeFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password: psw })
    });

    if (error) throw new Error(error);
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    await safeFetch('/api/auth/logout', { 
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    });
    localStorage.removeItem('token');
    setUser(null);
  };

  const resetPassword = async (credential: string) => {
    const { data, error } = await safeFetch('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ credential })
    });

    if (error) throw new Error(error);
    return data;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const token = localStorage.getItem('token');
    const { error } = await safeFetch('/api/auth/update-password', {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : {},
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (error) throw new Error(error);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
