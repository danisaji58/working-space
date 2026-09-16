'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserSession } from '@/types/api';
import { loginUser, logoutUser, LoginPayload } from '@/lib/api/auth';
import { setAuthToken, removeAuthToken } from '@/lib/api/client';

interface AuthContextType {
  user: UserSession['user'] | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginPayload) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserSession['user']>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'ssb_user_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession['user'] | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  // Load session from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const session: UserSession = JSON.parse(stored);
        if (session && session.token) {
          setUser(session.user);
          setRole(session.role);
          setToken(session.token);
          setAuthToken(session.token);
        }
      }
    } catch (e) {
      console.error('Failed to parse saved user session', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(
    async (credentials: LoginPayload) => {
      setIsLoading(true);
      try {
        const res = await loginUser(credentials);
        if (res.status && res.data) {
          const session = res.data;
          setUser(session.user);
          setRole(session.role);
          setToken(session.token);
          setAuthToken(session.token);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));

          return {
            success: true,
            message: res.message || 'Login berhasil.',
            role: session.role,
          };
        } else {
          return {
            success: false,
            message: res.message || 'Username atau password salah.',
          };
        }
      } catch (err: unknown) {
        const error = err as Error;
        return {
          success: false,
          message: error.message || 'Terjadi kesalahan saat login.',
        };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    setRole(null);
    setToken(null);
    removeAuthToken();
    localStorage.removeItem(STORAGE_KEY);
    router.push('/login');
  }, [router]);

  const updateUser = useCallback((updated: Partial<UserSession['user']>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updated };
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const session = JSON.parse(stored);
          session.user = next;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        } catch {
          // ignore
        }
      }
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
