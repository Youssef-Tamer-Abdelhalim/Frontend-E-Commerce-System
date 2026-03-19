// API Response Types

import type { User } from './user';
import type { Product } from './product';
import type { Cart as BaseCart, CartItem as BaseCartItem } from './cart';
import type { Address as BaseAddress } from './address';

export interface PaginationResult {
  currentPage: number;
  limit: number;
  numberOfPages: number;
  nextPage?: number;
  prevPage?: number;
}

export interface ApiResponse<T> {
  status?: string;
  message?: string;
  results?: number;
  paginationResult?: PaginationResult;
  pagination?: PaginationResult; // Some endpoints use 'pagination' instead of 'paginationResult'
  data: T;
}

export interface ApiError {
  status: 'error';
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthResponse {
  status: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface SignupResponse {
  status: string;
  message: string;
  data: {
    user: {
      _id: string;
      name: string;
      email: string;
    };
  };
}

export interface VerifyEmailResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
  };
}

export interface RefreshTokenResponse {
  status: string;
  accessToken: string;
}

// Re-export with different names to avoid conflicts
export type CartItemAPI = BaseCartItem & {
  product: string | Product;
};

export type CartAPI = BaseCart;

export interface CartResponse {
  status: string;
  message?: string;
  numOfCartItems?: number;
  numberOfItems?: number;
  data: BaseCart;
}

export interface WishlistResponse {
  status: string;
  results: number;
  data: Product[];
}

export type AddressAPI = BaseAddress;

export interface AddressesResponse {
  status: string;
  results: number;
  data: BaseAddress[];
}

export interface CheckoutSessionResponse {
  status: string;
  session: {
    id: string;
    url: string;
  };
}
