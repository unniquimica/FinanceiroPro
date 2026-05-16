import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

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

const mapSupabaseError = (error: any) => {
  if (!error) return null;
  const msg = error.message.toLowerCase();
  if (msg.includes('invalid login credentials') || msg.includes('email not confirmed')) return 'E-mail ou senha incorretos.';
  if (msg.includes('user already registered')) return 'Este e-mail já está cadastrado.';
  if (msg.includes('password is too short')) return 'A senha deve ter pelo menos 6 caracteres.';
  if (msg.includes('too many requests')) return 'Muitas tentativas. Tente novamente mais tarde.';
  return error.message;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and sets relevant state
    const setSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || 'Usuário',
          role: 'user'
        });
      }
      setIsLoading(false);
    };

    setSession();

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata.username || session.user.email?.split('@')[0] || 'Usuário',
          role: 'user'
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, psw: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: psw,
    });

    if (error) throw new Error(mapSupabaseError(error) || 'Erro ao realizar login');
  };

  const register = async (username: string, email: string, psw: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password: psw,
      options: {
        data: {
          username: username,
        },
      },
    });

    if (error) throw new Error(mapSupabaseError(error) || 'Erro ao realizar cadastro');
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/configuracoes`,
    });

    if (error) throw new Error(mapSupabaseError(error) || 'Erro ao enviar e-mail de recuperação');
    return { message: 'Verifique seu e-mail para redefinir sua senha.' };
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    // Note: currentPassword is not strictly required by Supabase updateUser but we can't easily verify it without re-auth
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) throw new Error(mapSupabaseError(error) || 'Erro ao atualizar senha');
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
