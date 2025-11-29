import apiClient from './client';
import { AddressesResponse, Address, CreateAddressData } from '@/types';

export const addressesApi = {
  // Get all addresses
  getAll: async (): Promise<AddressesResponse> => {
    const response = await apiClient.get('/addresses');
    return response.data;
  },

  // Add new address
  add: async (data: CreateAddressData): Promise<{ status: string; data: Address[] }> => {
    const response = await apiClient.post('/addresses', data);
    return response.data;
  },

  // Remove address
  remove: async (addressId: string): Promise<{ status: string; data: Address[] }> => {
    const response = await apiClient.delete(`/addresses/${addressId}`);
    return response.data;
  },
};
