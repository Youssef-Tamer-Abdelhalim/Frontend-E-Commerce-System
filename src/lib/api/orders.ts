import apiClient from './client';
import { ApiResponse, Order, CreateOrderData, CheckoutSessionResponse } from '@/types';

export const ordersApi = {
  // Get my orders (for regular users)
  getMyOrders: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders/my-orders', { params });
    return response.data;
  },

  // Get all orders (for admin/manager only)
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<Order[]>> => {
    const response = await apiClient.get('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getById: async (id: string): Promise<{ data: Order }> => {
    const response = await apiClient.get(`/orders/${id}`);
    return response.data;
  },

  // Create cash order
  createCashOrder: async (cartId: string, data: CreateOrderData): Promise<{ status: string; data: Order }> => {
    const response = await apiClient.post(`/orders/${cartId}`, data);
    return response.data;
  },

  // Create Stripe checkout session
  createCheckoutSession: async (cartId: string, data: CreateOrderData): Promise<CheckoutSessionResponse> => {
    const response = await apiClient.post(`/orders/checkout-session/${cartId}`, data);
    return response.data;
  },

  // ============ Admin/Manager Only ============

  // Update order paid status
  updatePaidStatus: async (id: string): Promise<{ data: Order }> => {
    const response = await apiClient.patch(`/orders/${id}/pay`);
    return response.data;
  },

  // Update order delivered status
  updateDeliveredStatus: async (id: string): Promise<{ data: Order }> => {
    const response = await apiClient.patch(`/orders/${id}/deliver`);
    return response.data;
  },
};
