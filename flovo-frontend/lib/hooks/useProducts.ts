import { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { ProductsService, type Product, type CreateProductRequest, type UpdateProductRequest } from '../services/products.service';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await ProductsService.getProducts();
      setProducts(response);
      setInitialized(true);
    } catch {
      notifications.show({
        color: 'red',
        title: 'Error',
        message: 'Failed to load products',
      });
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (data: CreateProductRequest): Promise<void> => {
    setLoading(true);
    try {
      const newProduct = await ProductsService.createProduct(data);
      setProducts(prev => [newProduct, ...prev]);
      notifications.show({
        color: 'green',
        title: 'Success!',
        message: 'Product created successfully',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to create product',
        message: error instanceof Error ? error.message : 'Unable to create product. Please try again.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (id: number, data: UpdateProductRequest): Promise<void> => {
    setLoading(true);
    try {
      const updatedProduct = await ProductsService.updateProduct(id, data);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      notifications.show({
        color: 'green',
        title: 'Success!',
        message: 'Product updated successfully',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to update product',
        message: error instanceof Error ? error.message : 'Unable to update product. Please try again.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: number): Promise<void> => {
    setLoading(true);
    try {
      await ProductsService.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      notifications.show({
        color: 'green',
        title: 'Success!',
        message: 'Product deleted successfully',
      });
    } catch (error: unknown) {
      notifications.show({
        color: 'red',
        title: 'Failed to delete product',
        message: error instanceof Error ? error.message : 'Unable to delete product. Please try again.',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialized) {
      fetchProducts();
    }
  }, [initialized]);

  return {
    products,
    loading,
    initialized,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
}
