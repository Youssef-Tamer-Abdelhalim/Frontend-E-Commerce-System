import { Address } from './address';

export type UserRole = 'user' | 'manager' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profileImg?: string;
  role: UserRole;
  active?: boolean;
  wishlist: string[];
  addresses: Address[];
  createdAt?: string;
  updatedAt?: string;
  avatar: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  password: string;
  passwordConfirm: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface VerifyResetCodeData {
  resetCode: string;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  confirmPassword: string;
}
