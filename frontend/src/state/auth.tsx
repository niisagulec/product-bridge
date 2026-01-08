import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getMe } from '../api/auth.api';
import { removeToken } from '../helpers/auth';
import type { User } from '../types/user';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  refreshMe: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    setIsLoading(true);
    try {
      const me = await getMe();
      setUser(me);
    } catch {

      removeToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  useEffect(() => {

    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }
    refreshMe();
  
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, isLoading, setUser, refreshMe, logout }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}


