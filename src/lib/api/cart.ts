import apiClient from './client';
import { CartResponse } from '@/types';

// Local type definitions
interface AddToCartData {
  productId: string;
  color?: string;
}

interface UpdateCartItemData {
  quantity: number;
}

interface UpdateCartItemColorData {
  color: string;
}

interface ApplyCouponData {
  couponName: string;
}

export const cartApi = {
  // Get cart
  get: async (): Promise<CartResponse> => {
    const response = await apiClient.get('/my-cart');
    return response.data;
  },

  // Add product to cart
  add: async (data: AddToCartData): Promise<CartResponse> => {
    const response = await apiClient.post('/my-cart', data);
    return response.data;
  },

  // Update cart item quantity
  updateQuantity: async (itemId: string, data: UpdateCartItemData): Promise<CartResponse> => {
    const response = await apiClient.patch(`/my-cart/${itemId}`, data);
    return response.data;
  },

  // Update cart item color
  updateColor: async (itemId: string, data: UpdateCartItemColorData): Promise<CartResponse> => {
    const response = await apiClient.patch(`/my-cart/${itemId}/color`, data);
    return response.data;
  },

  // Remove item from cart
  removeItem: async (itemId: string): Promise<CartResponse> => {
    const response = await apiClient.delete(`/my-cart/${itemId}`);
    return response.data;
  },

  // Clear cart
  clear: async (): Promise<void> => {
    await apiClient.delete('/my-cart');
  },

  // Apply coupon
  applyCoupon: async (data: ApplyCouponData): Promise<CartResponse> => {
    const response = await apiClient.patch('/my-cart/applyCoupon', data);
    return response.data;
  },
};
