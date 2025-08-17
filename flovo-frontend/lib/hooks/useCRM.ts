import { useState, useEffect } from 'react';
import { crmService, CustomerProfile, CRMInsights } from '../services/crm.service';

export function useCRM() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [crmInsights, setCrmInsights] = useState<CRMInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCRMInsights = async () => {
    try {
      setError(null);
      const data = await crmService.getCRMInsights();
      setCrmInsights(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CRM insights');
      throw err;
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchCustomers(), fetchCRMInsights()]);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return {
    // Data
    customers,
    crmInsights,
    
    // State
    loading,
    error,
    
    // Actions
    fetchCustomers,
    fetchCRMInsights,
    refreshAll,
  };
}

export function useCustomerProfile(customerId: string) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getCustomerProfile(customerId);
      setCustomer(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer profile');
    } finally {
      setLoading(false);
    }
  };

  const updateCustomer = async (updates: Partial<CustomerProfile>) => {
    try {
      setError(null);
      const data = await crmService.updateCustomerProfile(customerId, updates);
      setCustomer(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update customer profile');
      throw err;
    }
  };

  const addAction = async (action: any) => {
    try {
      setError(null);
      await crmService.addCustomerAction(customerId, action);
      await fetchCustomer(); // Refresh customer data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add customer action');
      throw err;
    }
  };

  const completeAction = async (actionId: string, outcome: string) => {
    try {
      setError(null);
      await crmService.completeCustomerAction(customerId, actionId, outcome);
      await fetchCustomer(); // Refresh customer data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete customer action');
      throw err;
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  return {
    // Data
    customer,
    
    // State
    loading,
    error,
    
    // Actions
    fetchCustomer,
    updateCustomer,
    addAction,
    completeAction,
  };
}

export function useCRMInsights() {
  const [insights, setInsights] = useState<CRMInsights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getCRMInsights();
      setInsights(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch CRM insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return { insights, loading, error, refetch: fetchInsights };
}

export function useCustomerList() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await crmService.getAllCustomers();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers };
}
