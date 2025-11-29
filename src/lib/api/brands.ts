import apiClient, { createFormData } from './client';
import { ApiResponse } from '@/types';

// Local type definitions
interface Brand {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface CreateBrandData {
  name: string;
  image?: File | string;
}

interface UpdateBrandData {
  name?: string;
  image?: File | string;
}

export const brandsApi = {
  // Get all brands
  getAll: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<ApiResponse<Brand[]>> => {
    const response = await apiClient.get('/brands', { params });
    return response.data;
  },

  // Get brand by ID
  getById: async (id: string): Promise<{ data: Brand }> => {
    const response = await apiClient.get(`/brands/${id}`);
    return response.data;
  },

  // ============ Admin/Manager Only ============

  // Create brand
  create: async (data: CreateBrandData): Promise<{ data: Brand }> => {
    if (data.image instanceof File) {
      const formData = createFormData(data as unknown as Record<string, unknown>);
      const response = await apiClient.post('/brands', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post('/brands', data);
    return response.data;
  },

  // Update brand
  update: async (id: string, data: UpdateBrandData): Promise<{ data: Brand }> => {
    if (data.image instanceof File) {
      const formData = createFormData(data as unknown as Record<string, unknown>);
      const response = await apiClient.put(`/brands/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(`/brands/${id}`, data);
    return response.data;
  },

  // Delete brand (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/brands/${id}`);
  },
};
