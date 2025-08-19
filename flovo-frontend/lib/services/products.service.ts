import { api } from '../api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export class ProductsService {
  static async getProducts(): Promise<Product[]> {
    return api<Product[]>('/products', {
      method: 'GET',
      auth: true,
    });
  }

  static async createProduct(data: CreateProductRequest): Promise<Product> {
    return api<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true,
    });
  }

  static async updateProduct(id: number, data: UpdateProductRequest): Promise<Product> {
    return api<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      auth: true,
    });
  }

  static async deleteProduct(id: number): Promise<Product> {
    return api<Product>(`/products/${id}`, {
      method: 'DELETE',
      auth: true,
    });
  }
}
