import apiClient from './client';
import {
  AuthResponse,
  SignupResponse,
  VerifyEmailResponse,
  RefreshTokenResponse,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  VerifyResetCodeData,
  ResetPasswordData,
  VerifyEmailData,
  ResendVerificationData,
} from '@/types';

export const authApi = {
  // Register new user (no token returned — must verify email first)
  signup: async (data: RegisterData): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/auth/signup', data);
    return response.data;
  },

  // Register alias for signup
  register: async (data: RegisterData): Promise<SignupResponse> => {
    const response = await apiClient.post<SignupResponse>('/auth/signup', data);
    return response.data;
  },

  // Verify email with 6-digit code (returns accessToken + refreshToken cookie)
  verifyEmail: async (data: VerifyEmailData): Promise<VerifyEmailResponse> => {
    const response = await apiClient.post<VerifyEmailResponse>('/auth/verifyemail', data);
    return response.data;
  },

  // Resend email verification code
  resendVerification: async (data: ResendVerificationData): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/resendverification', data);
    return response.data;
  },

  // Login (returns accessToken + refreshToken cookie)
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Refresh access token (uses refreshToken cookie automatically)
  refresh: async (): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  // Logout (clears refreshToken cookie)
  logout: async (): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // Forgot password - send reset code to email
  forgotPassword: async (data: ForgotPasswordData): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/forgetpassword', data);
    return response.data;
  },

  // Verify reset code (8-digit code, valid for 10 minutes)
  verifyResetCode: async (data: VerifyResetCodeData): Promise<{ status: string; message: string }> => {
    const response = await apiClient.post('/auth/verifyresetcode', data);
    return response.data;
  },

  // Reset password (returns accessToken + refreshToken cookie)
  resetPassword: async (data: ResetPasswordData): Promise<{ status: string; message: string; accessToken: string }> => {
    const response = await apiClient.put('/auth/resetpassword', data);
    return response.data;
  },
};
