import { api } from '../api';

export interface Order {
  id: number;
  status: string;
  customerName?: string;
  customerContact?: string;
  customerAddress?: string;
  details: { items?: string };
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
}

export class OrdersService {
  static async getOrders(page: number = 1, limit: number = 10): Promise<OrdersResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    return api<OrdersResponse>(`/orders?${params}`, {
      method: 'GET',
      auth: true,
    });
  }
}
