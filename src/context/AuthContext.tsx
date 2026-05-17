import React, { createContext, useContext, useEffect, useState } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, psw: string) => Promise<void>;
  register: (username: string, email: string, psw: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets relevant state
    const setSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (e) {
        console.error('Error fetching user sessions', e);
      } finally {
        setIsLoading(false);
      }
    };

    setSession();
  }, []);

  const login = async (credential: string, psw: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, password: psw })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar login');
    setUser(data.user);
  };

  const register = async (username: string, email: string, psw: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password: psw })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao realizar cadastro');
    // After register, user might need to login or we auto-login
    await login(email, psw);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: email })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao enviar e-mail de recuperação');
    return data;
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao atualizar senha');
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
