import apiClient from './client';
import { ApiResponse, Review, CreateReviewData, UpdateReviewData } from '@/types';

export const reviewsApi = {
  // Get reviews for a product
  getForProduct: async (
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Review[]>> => {
    const response = await apiClient.get(`/products/${productId}/reviews`, { params });
    return response.data;
  },

  // Create review for a product
  create: async (productId: string, data: CreateReviewData): Promise<{ data: Review }> => {
    const response = await apiClient.post(`/products/${productId}/reviews`, data);
    return response.data;
  },

  // Update review
  update: async (id: string, data: UpdateReviewData): Promise<{ data: Review }> => {
    const response = await apiClient.put(`/reviews/${id}`, data);
    return response.data;
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reviews/${id}`);
  },

  // ============ Admin Only ============

  // Get all reviews (for admin)
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Review[]>> => {
    const response = await apiClient.get('/reviews', { params });
    return response.data;
  },
};
