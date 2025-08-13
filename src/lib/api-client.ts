import { toast } from 'sonner';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    total: number;
    perPage: number;
    currentPage: number;
    lastPage: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333') {
    this.baseURL = baseURL;
    
    // Load token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('authToken', token);
      } else {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid
        this.setToken(null);
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        throw new Error('Token expirado. Redirecionando para login...');
      }

      const errorData = await response.json().catch(() => ({ 
        message: `HTTP Error ${response.status}` 
      }));
      
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return response.json();
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      return this.handleResponse<T>(response);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro na requisição';
      toast.error(errorMessage);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.post<ApiResponse<{
      user: Record<string, unknown>;
      token: string;
      expiresAt: string;
    }>>('/api/auth/login', { email, password });

    if (response.success && response.data) {
      this.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }

    return response;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }) {
    return this.post<ApiResponse>('/api/auth/register', userData);
  }

  async logout() {
    try {
      await this.post('/api/auth/logout');
    } finally {
      this.setToken(null);
    }
  }

  async getProfile() {
    return this.get<ApiResponse<{ user: Record<string, unknown> }>>('/api/auth/me');
  }

  // Health check
  async healthCheck() {
    return this.get<{ status: string; timestamp: string; uptime: number }>('/health');
  }
}

export const apiClient = new ApiClient();

// Convenience methods for different resources
export const authAPI = {
  login: (email: string, password: string) => apiClient.login(email, password),
  register: (data: { name: string; email: string; password: string; role?: string; }) => apiClient.register(data),
  logout: () => apiClient.logout(),
  getProfile: () => apiClient.getProfile(),
};

export const identitiesAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/identities${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/identities/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/identities', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/identities/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/identities/${id}`),
  getByType: (type: string) => apiClient.get<ApiResponse>(`/api/identities/type/${type}`),
};

export const conversationsAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/conversations${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/conversations/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/conversations', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/conversations/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/conversations/${id}`),
  addTranscript: (id: number, data: Record<string, unknown>) => apiClient.post<ApiResponse>(`/api/conversations/${id}/transcript`, data),
  addSummary: (id: number, data: Record<string, unknown>) => apiClient.post<ApiResponse>(`/api/conversations/${id}/summaries`, data),
  addKnowledge: (id: number, data: Record<string, unknown>) => apiClient.post<ApiResponse>(`/api/conversations/${id}/knowledge`, data),
};

export const agentsAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/agents${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/agents/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/agents', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/agents/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/agents/${id}`),
  test: (id: number) => apiClient.post<ApiResponse>(`/api/agents/${id}/test`),
};

export const databasesAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/databases${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/databases/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/databases', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/databases/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/databases/${id}`),
  test: (id: number) => apiClient.post<ApiResponse>(`/api/databases/${id}/test`),
};

export const memoriesAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/memories${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/memories/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/memories', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/memories/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/memories/${id}`),
  import: (id: number, data: Record<string, unknown>) => apiClient.post<ApiResponse>(`/api/memories/${id}/import`, data),
};

export const flowsAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/flows${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/flows/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/flows', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/flows/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/flows/${id}`),
  execute: (id: number) => apiClient.post<ApiResponse>(`/api/flows/${id}/execute`),
};

export const usersAPI = {
  getAll: (params?: Record<string, string | number>) => apiClient.get<ApiResponse>(`/api/users${params ? `?${new URLSearchParams(params as Record<string, string>)}` : ''}`),
  getById: (id: number) => apiClient.get<ApiResponse>(`/api/users/${id}`),
  create: (data: Record<string, unknown>) => apiClient.post<ApiResponse>('/api/users', data),
  update: (id: number, data: Record<string, unknown>) => apiClient.put<ApiResponse>(`/api/users/${id}`, data),
  delete: (id: number) => apiClient.delete<ApiResponse>(`/api/users/${id}`),
};