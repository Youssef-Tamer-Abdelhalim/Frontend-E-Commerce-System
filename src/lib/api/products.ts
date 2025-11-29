import apiClient, { createFormData } from './client';
import {
  ApiResponse,
  Product,
  ProductFilters,
  CreateProductData,
  UpdateProductData,
} from '@/types';

export const productsApi = {
  // Get all products with filters
  getAll: async (filters?: ProductFilters): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.get('/products', { params: filters });
    return response.data;
  },

  // Get product by ID
  getById: async (id: string): Promise<{ data: Product }> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  // ============ Admin/Manager Only ============

  // Create product
  create: async (data: CreateProductData): Promise<{ data: Product }> => {
    const formData = createFormData(data as unknown as Record<string, unknown>);
    const response = await apiClient.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update product
  update: async (id: string, data: UpdateProductData): Promise<{ data: Product }> => {
    // Check if there are files
    const hasFiles = data.imageCover instanceof File || 
      (data.images && data.images.some(img => img instanceof File));
    
    if (hasFiles) {
      const formData = createFormData(data as unknown as Record<string, unknown>);
      const response = await apiClient.put(`/products/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    
    const response = await apiClient.put(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};
