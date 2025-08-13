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
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string | string[]) => boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage and validate token
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = apiClient.getToken();
        if (!token) {
          setLoading(false);
          return;
        }

        // Validate token by fetching user profile
        const response = await authAPI.getProfile();
        if (response.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          // Invalid token, clear auth
          apiClient.setToken(null);
          setUser(null);
        }
      } catch (error: any) {
        console.error('Auth initialization error:', error);
        // Token might be expired or invalid
        apiClient.setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        toast.success('Login realizado com sucesso!');
        
        // Redirect to admin panel or intended route
        const intendedRoute = sessionStorage.getItem('intendedRoute');
        if (intendedRoute) {
          sessionStorage.removeItem('intendedRoute');
          router.push(intendedRoute);
        } else {
          router.push('/admin');
        }
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Erro no login');
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
  }): Promise<void> => {
    try {
      setLoading(true);
      const response = await authAPI.register({
        ...userData,
        role: userData.role || 'user',
      });
      
      if (response.success) {
        toast.success('Usuário registrado com sucesso! Faça login para continuar.');
        router.push('/login');
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (error: any) {
      console.error('Register error:', error);
      toast.error(error.message || 'Erro no registro');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await authAPI.logout();
      toast.success('Logout realizado com sucesso');
    } catch (error: any) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      setUser(null);
      setLoading(false);
      router.push('/login');
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const response = await authAPI.getProfile();
      if (response.success && response.data?.user) {
        setUser(response.data.user);
      }
    } catch (error: any) {
      console.error('Refresh user error:', error);
      // Token might be expired, trigger logout
      await logout();
    }
  };

  const hasRole = (roles: string | string[]): boolean => {
    if (!user) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
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

export default AuthContext;