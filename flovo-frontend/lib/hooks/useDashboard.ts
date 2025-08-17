import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  last7DaysOrders: number;
  last30DaysOrders: number;
  averageOrderValue?: number;
  topProducts?: Array<{ name: string; count: number }>;
}

export function useDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/orders/summary');
      setSummary(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  return {
    summary,
    loading,
    error,
    refreshSummary: fetchSummary,
  };
}
