import apiClient, { createFormData } from './client';
import { ApiResponse } from '@/types';

// Local type definitions to avoid import issues
interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
}

interface SubCategory {
  _id: string;
  name: string;
  slug: string;
  category: string | Category;
}

interface CreateCategoryData {
  name: string;
  image?: File | string;
}

interface UpdateCategoryData {
  name?: string;
  image?: File | string;
}

interface CreateSubCategoryData {
  name: string;
  category: string;
}

interface UpdateSubCategoryData {
  name?: string;
  category?: string;
}

export const categoriesApi = {
  // Get all categories
  getAll: async (params?: { page?: number; limit?: number; keyword?: string }): Promise<ApiResponse<Category[]>> => {
    const response = await apiClient.get('/categories', { params });
    return response.data;
  },

  // Get category by ID
  getById: async (id: string): Promise<{ data: Category }> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Get subcategories for a category
  getSubcategories: async (categoryId: string): Promise<ApiResponse<SubCategory[]>> => {
    const response = await apiClient.get(`/categories/${categoryId}/subcategories`);
    return response.data;
  },

  // ============ Admin/Manager Only ============

  // Create category
  create: async (data: CreateCategoryData): Promise<{ data: Category }> => {
    if (data.image instanceof File) {
      const formData = createFormData(data as unknown as Record<string, unknown>);
      const response = await apiClient.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.post('/categories', data);
    return response.data;
  },

  // Update category
  update: async (id: string, data: UpdateCategoryData): Promise<{ data: Category }> => {
    if (data.image instanceof File) {
      const formData = createFormData(data as unknown as Record<string, unknown>);
      const response = await apiClient.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    const response = await apiClient.put(`/categories/${id}`, data);
    return response.data;
  },

  // Delete category (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};

export const subcategoriesApi = {
  // Get all subcategories
  getAll: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<SubCategory[]>> => {
    const response = await apiClient.get('/subcategories', { params });
    return response.data;
  },

  // Get subcategory by ID
  getById: async (id: string): Promise<{ data: SubCategory }> => {
    const response = await apiClient.get(`/subcategories/${id}`);
    return response.data;
  },

  // ============ Admin/Manager Only ============

  // Create subcategory
  create: async (data: CreateSubCategoryData): Promise<{ data: SubCategory }> => {
    const response = await apiClient.post('/subcategories', data);
    return response.data;
  },

  // Update subcategory
  update: async (id: string, data: UpdateSubCategoryData): Promise<{ data: SubCategory }> => {
    const response = await apiClient.put(`/subcategories/${id}`, data);
    return response.data;
  },

  // Delete subcategory (Admin only)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/subcategories/${id}`);
  },
};
