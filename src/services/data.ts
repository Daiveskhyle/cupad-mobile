/**
 * Online-first data service with SQLite offline fallback.
 */
import { api } from '../api/client';
import {
  kvGet,
  kvSet,
  cacheClients,
  searchClientsLocal,
  cacheActivities,
  getActivitiesLocal,
  enqueueOp,
} from '../db';

const STATS_KEY = 'dashboard_stats';

export type StatsSource = 'network' | 'cache' | 'none';

function emptyStats() {
  return {
    monthly_net_savings: 0,
    monthly_disbursed: 0,
    active_loans: 0,
    total_savings: 0,
    total_loans_outstanding: 0,
    portfolio_net: 0,
    clients: 0,
    savings_today: 0,
    collected_today: 0,
    collected_month: 0,
    net_savings_month: 0,
    outstanding: 0,
    unions: [],
  };
}

export async function loadDashboardStats(): Promise<{
  data: any | null;
  source: StatsSource;
  error?: string;
}> {
  try {
    const data = await api.getDashboardStats();
    if (data) {
      await kvSet(STATS_KEY, data);
      return { data, source: 'network' };
    }
    const cached = await kvGet(STATS_KEY);
    if (cached) {
      return {
        data: cached,
        source: 'cache',
        error: 'Server still on API v1.1 — showing offline cache. Deploy server-api/v1-index.php',
      };
    }
    return {
      data: emptyStats(),
      source: 'none',
      error: 'No stats. Deploy API v1.2 (server-api/v1-index.php → api/v1/index.php)',
    };
  } catch (e: any) {
    const cached = await kvGet(STATS_KEY);
    if (cached) {
      return { data: cached, source: 'cache', error: 'Offline — cached stats' };
    }
    return {
      data: emptyStats(),
      source: 'none',
      error: e?.response?.data?.error || e?.message || 'Could not load stats',
    };
  }
}

export async function loadActivities(limit = 40): Promise<{
  data: any[];
  source: StatsSource;
  error?: string;
}> {
  try {
    const data = await api.getActivities(limit);
    if (data && data.length) {
      await cacheActivities(data);
      return { data, source: 'network' };
    }
    const cached = await getActivitiesLocal(limit);
    if (cached.length) {
      return { data: cached, source: 'cache', error: 'Showing offline activity' };
    }
    return {
      data: [],
      source: 'none',
      error: 'No activity yet (or API v1.2 not deployed)',
    };
  } catch (e: any) {
    const cached = await getActivitiesLocal(limit);
    if (cached.length) {
      return { data: cached, source: 'cache', error: 'Offline — cached activity' };
    }
    return {
      data: [],
      source: 'none',
      error: e?.response?.data?.error || e?.message || 'Could not load activity',
    };
  }
}

export async function searchClients(q: string, limit = 30): Promise<{
  data: any[];
  source: StatsSource;
  error?: string;
}> {
  try {
    const res = await api.getClients({ q, limit });
    const list = res.data || [];
    if (list.length) await cacheClients(list);
    if (list.length) return { data: list, source: 'network' };
    const local = await searchClientsLocal(q, limit);
    if (local.length) return { data: local, source: 'cache' };
    return { data: [], source: 'network' };
  } catch (e: any) {
    const local = await searchClientsLocal(q, limit);
    if (local.length) {
      return { data: local, source: 'cache', error: 'Offline — local clients' };
    }
    return {
      data: [],
      source: 'none',
      error: e?.response?.data?.error || e?.message || 'Search failed',
    };
  }
}

export async function collectSavingsOnlineOrQueue(payload: {
  client_id: string;
  amount: number;
  notes?: string;
}) {
  try {
    const res = await api.collectSavings(payload);
    if (res?.success) return { ...res, queued: false };
    throw new Error(res?.error || 'Failed');
  } catch (e: any) {
    const status = e?.response?.status;
    if (!status || status >= 500 || status === 404) {
      await enqueueOp('savings_collect', payload);
      return {
        success: true,
        queued: true,
        message: 'Saved offline. Will sync when API is available.',
      };
    }
    throw e;
  }
}

export async function withdrawOnlineOrQueue(payload: any) {
  try {
    const res = await api.withdrawSavings(payload);
    if (res?.success) return { ...res, queued: false };
    throw new Error(res?.error || 'Failed');
  } catch (e: any) {
    const status = e?.response?.status;
    if (!status || status >= 500 || status === 404) {
      await enqueueOp('savings_withdraw', payload);
      return { success: true, queued: true, message: 'Saved offline. Will sync later.' };
    }
    throw e;
  }
}

export async function collectLoanOnlineOrQueue(payload: any) {
  try {
    const res = await api.collectLoan(payload);
    if (res?.success) return { ...res, queued: false };
    throw new Error(res?.error || 'Failed');
  } catch (e: any) {
    const status = e?.response?.status;
    if (!status || status >= 500 || status === 404) {
      await enqueueOp('loan_collect', payload);
      return { success: true, queued: true, message: 'Saved offline. Will sync later.' };
    }
    throw e;
  }
}

export async function disburseOnlineOrQueue(payload: any) {
  try {
    const res = await api.disburseLoan(payload);
    if (res?.success) return { ...res, queued: false };
    throw new Error(res?.error || 'Failed');
  } catch (e: any) {
    const status = e?.response?.status;
    if (!status || status >= 500 || status === 404) {
      await enqueueOp('loan_disburse', payload);
      return { success: true, queued: true, message: 'Saved offline. Will sync later.' };
    }
    throw e;
  }
}

export async function registerOnlineOrQueue(payload: any) {
  try {
    const res = await api.registerClient(payload);
    if (res?.success) return { ...res, queued: false };
    throw new Error(res?.error || 'Failed');
  } catch (e: any) {
    const status = e?.response?.status;
    if (!status || status >= 500 || status === 404) {
      await enqueueOp('client_register', payload);
      return { success: true, queued: true, message: 'Saved offline. Will sync later.' };
    }
    throw e;
  }
}
