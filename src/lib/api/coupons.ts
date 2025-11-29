import apiClient from './client';
import { ApiResponse, Coupon, CreateCouponData, UpdateCouponData } from '@/types';

export const couponsApi = {
  // Get all coupons (Admin/Manager only)
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Coupon[]>> => {
    const response = await apiClient.get('/coupons', { params });
    return response.data;
  },

  // Get coupon by ID
  getById: async (id: string): Promise<{ data: Coupon }> => {
    const response = await apiClient.get(`/coupons/${id}`);
    return response.data;
  },

  // Create coupon
  create: async (data: CreateCouponData): Promise<{ data: Coupon }> => {
    const response = await apiClient.post('/coupons', data);
    return response.data;
  },

  // Update coupon
  update: async (id: string, data: UpdateCouponData): Promise<{ data: Coupon }> => {
    const response = await apiClient.put(`/coupons/${id}`, data);
    return response.data;
  },

  // Delete coupon
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/coupons/${id}`);
  },
};
