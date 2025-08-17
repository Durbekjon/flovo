import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { OrdersService, type Order } from '../services/orders.service';

export function useOrders(page: number = 1, limit: number = 10) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchOrders = async (): Promise<void> => {
    setLoading(true);
    try {
      console.log('Fetching orders...');
      const response = await OrdersService.getOrders(page, limit);
      console.log('Orders response:', response);
      setOrders(response.orders);
      setTotal(response.total);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to load orders',
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  useEffect(() => {
    fetchOrders();
  }, [page, limit]);

  return {
    orders,
    total,
    loading,
    refreshOrders,
  };
}
