'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authAPI, apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'user';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasRole: (role: string | string[]) => boolean;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated
  const isAuthenticated = !!user;

  useEffect(() => {
    // Check for existing token and validate it
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          // Set token in API client
          apiClient.setToken(token);
          
          // Try to validate token by fetching user profile
          try {
            const response = await authAPI.getProfile();
            if (response.success && response.data?.user) {
              setUser(response.data.user as unknown as User);
            } else {
              throw new Error('Invalid user data');
            }
          } catch (error) {
            // Token is invalid, clear it
            console.error('Token validation failed:', error);
            apiClient.setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user as unknown as User);
        toast.success('Login realizado com sucesso!');
        
        // Check for intended route
        const intendedRoute = sessionStorage.getItem('intendedRoute');
        if (intendedRoute) {
          sessionStorage.removeItem('intendedRoute');
          router.push(intendedRoute);
        } else {
          router.push('/admin');
        }
      } else {
        throw new Error(response.message || 'Falha no login');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no login';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => {
    try {
      setLoading(true);
      const response = await authAPI.register(userData);
      
      if (response.success) {
        toast.success('Usuário registrado com sucesso! Faça login para continuar.');
        router.push('/login');
      } else {
        throw new Error(response.message || 'Falha no registro');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro no registro';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      toast.success('Logout realizado com sucesso!');
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user as unknown as User);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      console.error('Refresh user error:', errorMessage);
      // Don't show toast for refresh errors to avoid spamming
    }
  };

  const hasRole = (role: string | string[]): boolean => {
    if (!user) return false;
    
    if (Array.isArray(role)) {
      return role.includes(user.role);
    }
    
    return user.role === role;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}