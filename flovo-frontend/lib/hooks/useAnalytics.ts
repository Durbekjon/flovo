import { useState, useEffect } from 'react';
import { analyticsService, DashboardSummary, SalesMetrics, CustomerAnalytics, ProductAnalytics, ConversationAnalytics, PerformanceInsights } from '../services/analytics.service';

export function useAnalytics() {
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [salesMetrics, setSalesMetrics] = useState<SalesMetrics | null>(null);
  const [customerAnalytics, setCustomerAnalytics] = useState<CustomerAnalytics | null>(null);
  const [productAnalytics, setProductAnalytics] = useState<ProductAnalytics | null>(null);
  const [conversationAnalytics, setConversationAnalytics] = useState<ConversationAnalytics | null>(null);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analyticsService.getDashboardSummary();
      setDashboardSummary(data);
      setSalesMetrics(data.salesMetrics);
      setCustomerAnalytics(data.customerAnalytics);
      setProductAnalytics(data.productAnalytics);
      setConversationAnalytics(data.conversationAnalytics);
      setPerformanceInsights(data.performanceInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesMetrics = async (period: 'day' | 'week' | 'month' | 'year' = 'month') => {
    try {
      setError(null);
      const data = await analyticsService.getSalesMetrics(period);
      setSalesMetrics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales metrics');
      throw err;
    }
  };

  const fetchCustomerAnalytics = async () => {
    try {
      setError(null);
      const data = await analyticsService.getCustomerAnalytics();
      setCustomerAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer analytics');
      throw err;
    }
  };

  const fetchProductAnalytics = async () => {
    try {
      setError(null);
      const data = await analyticsService.getProductAnalytics();
      setProductAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product analytics');
      throw err;
    }
  };

  const fetchConversationAnalytics = async () => {
    try {
      setError(null);
      const data = await analyticsService.getConversationAnalytics();
      setConversationAnalytics(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversation analytics');
      throw err;
    }
  };

  const fetchPerformanceInsights = async () => {
    try {
      setError(null);
      const data = await analyticsService.getPerformanceInsights();
      setPerformanceInsights(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance insights');
      throw err;
    }
  };

  const refreshAll = async () => {
    await fetchDashboardSummary();
  };

  useEffect(() => {
    fetchDashboardSummary();
  }, []);

  return {
    // Data
    dashboardSummary,
    salesMetrics,
    customerAnalytics,
    productAnalytics,
    conversationAnalytics,
    performanceInsights,
    
    // State
    loading,
    error,
    
    // Actions
    fetchDashboardSummary,
    fetchSalesMetrics,
    fetchCustomerAnalytics,
    fetchProductAnalytics,
    fetchConversationAnalytics,
    fetchPerformanceInsights,
    refreshAll,
  };
}

export function useSalesMetrics(period: 'day' | 'week' | 'month' | 'year' = 'month') {
  const [data, setData] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await analyticsService.getSalesMetrics(period);
      setData(metrics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period]);

  return { data, loading, error, refetch: fetchData };
}

export function useCustomerAnalytics() {
  const [data, setData] = useState<CustomerAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await analyticsService.getCustomerAnalytics();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useProductAnalytics() {
  const [data, setData] = useState<ProductAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await analyticsService.getProductAnalytics();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function useConversationAnalytics() {
  const [data, setData] = useState<ConversationAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const analytics = await analyticsService.getConversationAnalytics();
      setData(analytics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch conversation analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export function usePerformanceInsights() {
  const [data, setData] = useState<PerformanceInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const insights = await analyticsService.getPerformanceInsights();
      setData(insights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch performance insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, error, refetch: fetchData };
}
