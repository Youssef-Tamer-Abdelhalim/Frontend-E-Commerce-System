import apiClient, { createFormData } from './client';
import { ApiResponse, User, UpdateUserData, UpdatePasswordData } from '@/types';

export const usersApi = {
  // Get current user
  getMe: async (): Promise<{ data: User }> => {
    const response = await apiClient.get('/users/getMe');
    return response.data;
  },

  // Update current user
  updateMe: async (data: UpdateUserData): Promise<{ data: User }> => {
    const response = await apiClient.put('/users/updateMe', data);
    return response.data;
  },

  // Update current user with image
  updateMeWithImage: async (data: UpdateUserData & { profileImg?: File }): Promise<{ data: User }> => {
    const formData = createFormData(data as Record<string, unknown>);
    const response = await apiClient.put('/users/updateMe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Update password
  updateMyPassword: async (data: UpdatePasswordData): Promise<{ data: User; token: string }> => {
    // Backend expects 'confirmPassword' but our type uses 'passwordConfirm'
    const requestData = {
      currentPassword: data.currentPassword,
      password: data.password,
      confirmPassword: data.passwordConfirm,
    };
    const response = await apiClient.put('/users/updateMyPassword', requestData);
    return response.data;
  },

  // Delete my account
  deleteMe: async (): Promise<void> => {
    await apiClient.delete('/users/deleteMe');
  },

  // ============ Admin Only ============

  // Get all users
  getAll: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<ApiResponse<User[]>> => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  // Get user by ID
  getById: async (id: string): Promise<{ data: User }> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  // Create user (admin)
  create: async (data: {
    name: string;
    email: string;
    password: string;
    role?: string;
  }): Promise<{ data: User }> => {
    const response = await apiClient.post('/users', data);
    return response.data;
  },

  // Update user (admin)
  update: async (id: string, data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  // Delete user (admin)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
