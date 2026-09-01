'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  accountType?: string;
  phone?: string;
  city?: string;
  plz?: string;
  avatar?: string;
  bio?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kleindeal_user');
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch (e) {
          localStorage.removeItem('kleindeal_user');
        }
      }
    }
  }, []);

  const login = (userData: User) => {
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kleindeal_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kleindeal_user');
      fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authMode,
        setAuthMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
