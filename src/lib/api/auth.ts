import apiClient from './client';
import {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
} from '@/types';

export const authApi = {
  // Register new user
  signup: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // Register alias for signup
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Forgot password - send reset code to email
  forgotPassword: async (data: ForgotPasswordData): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/forgetpassword', data);
    return response.data;
  },

  // Verify reset code
  verifyResetCode: async (data: VerifyResetCodeData): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/verifyresetcode', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordData): Promise<{ status: string; message: string; token: string }> => {
    const response = await apiClient.put('/auth/resetpassword', data);
    return response.data;
  },
};
