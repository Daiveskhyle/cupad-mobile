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

    this.client.interceptors.request.use(async (config) => {
      const token = await storageGet(TOKEN_KEY);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

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

  // ---------- Clients (now works with JWT after API deploy) ----------
  async getClients(params?: {
    q?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Client[]>> {
    const { data } = await this.client.get<ApiResponse<Client[]>>('/clients', {
      params,
    });
    return data;
  }

  async getPortfolio(clientId: string): Promise<Portfolio> {
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

  // ---------- Dashboard ----------
  async getDashboardStats(): Promise<{
    clients: number;
    savings_today: number;
    collected_today: number;
    outstanding: number;
    net_savings_month: number;
  } | null> {
    try {
      const { data } = await this.client.get<{ success: boolean; data: any }>(
        '/dashboard/stats'
      );
      return data.success ? data.data : null;
    } catch {
      return null;
    }
  }

  async getActivities(limit = 30): Promise<any[]> {
    try {
      const { data } = await this.client.get<ApiResponse<any[]>>('/activities', {
        params: { limit },
      });
      return data.data || [];
    } catch {
      return [];
    }
  }

  // ---------- Write operations (require API v1.2 on server) ----------
  async collectSavings(payload: {
    client_id: string;
    amount: number;
    notes?: string;
  }) {
    const { data } = await this.client.post('/savings/collect', payload);
    return data;
  }

  async withdrawSavings(payload: {
    client_id: string;
    amount: number;
    notes?: string;
    reason?: string;
  }) {
    const { data } = await this.client.post('/savings/withdraw', payload);
    return data;
  }

  async collectLoan(payload: {
    client_id: string;
    amount: number;
    notes?: string;
    loan_id?: string | number;
  }) {
    const { data } = await this.client.post('/loans/collect', payload);
    return data;
  }

  async disburseLoan(payload: {
    client_id: string;
    principal: number;
    interest_rate: number;
    num_installments: number;
    loan_term_type: string;
  }) {
    const { data } = await this.client.post('/loans/disburse', payload);
    return data;
  }

  async registerClient(payload: {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    client_type?: string;
    registration_fee?: number;
  }) {
    const { data } = await this.client.post('/clients/register', payload);
    return data;
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
