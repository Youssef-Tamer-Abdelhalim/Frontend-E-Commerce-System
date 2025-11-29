import apiClient from './client';
import { WishlistResponse } from '@/types';

export const wishlistApi = {
  // Get wishlist
  get: async (): Promise<WishlistResponse> => {
    const response = await apiClient.get('/wishlist');
    return response.data;
  },

  // Add product to wishlist
  add: async (productId: string): Promise<{ status: string; message: string; data: string[] }> => {
    const response = await apiClient.post('/wishlist', { productId });
    return response.data;
  },

  // Remove product from wishlist
  remove: async (productId: string): Promise<{ status: string; message: string; data: string[] }> => {
    const response = await apiClient.delete(`/wishlist/${productId}`);
    return response.data;
  },
};
