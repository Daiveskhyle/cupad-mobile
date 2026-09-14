import axios, { AxiosInstance, AxiosError } from 'axios';
import { storageGet, storageSet, storageDelete } from '../utils/storage';
import { API_BASE_URL } from '../constants/config';
import type {
  LoginResponse,
  User,
  Client,
  Portfolio,
  Saving,
  Loan,
  Transaction,
  ApiResponse,
} from '../types';

const TOKEN_KEY = 'cupad_jwt';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 20000,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Attach JWT automatically
    this.client.interceptors.request.use(async (config) => {
      const token = await storageGet(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle 401 globally
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  async setToken(token: string) {
    await storageSet(TOKEN_KEY, token);
  }

  async getToken(): Promise<string | null> {
    return storageGet(TOKEN_KEY);
  }

  async clearToken() {
    await storageDelete(TOKEN_KEY);
  }

  // ---------- Auth ----------
  async login(username: string, password: string): Promise<LoginResponse> {
    const { data } = await this.client.post<LoginResponse>('/auth/login', {
      username,
      password,
    });
    if (data.success && data.token) {
      await this.setToken(data.token);
    }
    return data;
  }

  async me(): Promise<User | null> {
    const { data } = await this.client.get<{ success: boolean; data: User }>('/me');
    return data.success ? data.data : null;
  }

  async logout() {
    await this.clearToken();
  }

  // ---------- Clients ----------
  async getClients(params?: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Client[]>> {
    // Note: This endpoint currently requires API Key on the server.
    // For mobile we primarily use JWT endpoints. Keep for future expansion.
    const { data } = await this.client.get<ApiResponse<Client[]>>('/clients', {
      params,
    });
    return data;
  }

  async getPortfolio(clientId: string): Promise<Portfolio> {
    // Prefer JWT-protected portfolio endpoint when available
    try {
      const { data } = await this.client.get<{ success: boolean; data: Portfolio }>(
        `/portfolio/${clientId}`
      );
      if (data.success) return data.data;
    } catch {
      // fallback
    }
    const { data } = await this.client.get<{ success: boolean; data: Portfolio }>(
      `/clients/${clientId}/portfolio`
    );
    if (!data.success) throw new Error('Failed to load portfolio');
    return data.data!;
  }

  async getSavings(clientId: string): Promise<Saving[]> {
    const { data } = await this.client.get<ApiResponse<Saving[]>>(
      `/clients/${clientId}/savings`
    );
    return data.data || [];
  }

  async getLoans(clientId: string): Promise<Loan[]> {
    const { data } = await this.client.get<ApiResponse<Loan[]>>(
      `/clients/${clientId}/loans`
    );
    return data.data || [];
  }

  async getTransactions(clientId: string): Promise<Transaction[]> {
    const { data } = await this.client.get<ApiResponse<Transaction[]>>(
      `/clients/${clientId}/transactions`
    );
    return data.data || [];
  }

  async health(): Promise<boolean> {
    try {
      const { data } = await this.client.get('/health');
      return data.success === true;
    } catch {
      return false;
    }
  }
}

export const api = new ApiClient();
