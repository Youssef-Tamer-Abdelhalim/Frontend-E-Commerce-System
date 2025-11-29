import { create } from 'zustand';
import { CartItem } from '@/types/cart';
import { cartApi } from '@/lib/api';

interface CartState {
  items: CartItem[];
  cartId: string | null;
  numOfCartItems: number;
  totalCartPrice: number;
  totalCartPriceAfterDiscount: number | null;
  isLoading: boolean;
  error: string | null;
}

interface CartActions {
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateColor: (itemId: string, color: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  resetCart: () => void;
}

type CartStore = CartState & CartActions;

const initialState: CartState = {
  items: [],
  cartId: null,
  numOfCartItems: 0,
  totalCartPrice: 0,
  totalCartPriceAfterDiscount: null,
  isLoading: false,
  error: null,
};

export const useCartStore = create<CartStore>()((set) => ({
  ...initialState,

  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.get();
      set({
        items: response.data.cartItems,
        cartId: response.data._id,
        numOfCartItems: response.numOfCartItems,
        totalCartPrice: response.data.totalCartPrice,
        totalCartPriceAfterDiscount: response.data.totalCartPriceAfterDiscount || null,
        isLoading: false,
      });
    } catch {
      // Cart might not exist yet
      set({ ...initialState, isLoading: false });
    }
  },

  addToCart: async (productId: string, color?: string) => {
    set({ isLoading: true, error: null });
    try {
      // Only include color if provided
      const data: { productId: string; color?: string } = { productId };
      if (color) {
        data.color = color;
      }
      const response = await cartApi.add(data);
      set({
        items: response.data.cartItems,
        cartId: response.data._id,
        numOfCartItems: response.numOfCartItems,
        totalCartPrice: response.data.totalCartPrice,
        totalCartPriceAfterDiscount: response.data.totalCartPriceAfterDiscount || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في إضافة المنتج للسلة';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.updateQuantity(itemId, { quantity });
      set({
        items: response.data.cartItems,
        numOfCartItems: response.numOfCartItems,
        totalCartPrice: response.data.totalCartPrice,
        totalCartPriceAfterDiscount: response.data.totalCartPriceAfterDiscount || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في تحديث الكمية';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateColor: async (itemId: string, color: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.updateColor(itemId, { color });
      set({
        items: response.data.cartItems,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في تغيير اللون';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  removeItem: async (itemId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.removeItem(itemId);
      set({
        items: response.data.cartItems,
        numOfCartItems: response.numOfCartItems,
        totalCartPrice: response.data.totalCartPrice,
        totalCartPriceAfterDiscount: response.data.totalCartPriceAfterDiscount || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في حذف المنتج';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await cartApi.clear();
      set({ ...initialState });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في تفريغ السلة';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  applyCoupon: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await cartApi.applyCoupon({ couponName: code });
      set({
        totalCartPrice: response.data.totalCartPrice,
        totalCartPriceAfterDiscount: response.data.totalCartPriceAfterDiscount || null,
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'كوبون غير صالح';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  resetCart: () => {
    set({ ...initialState });
  },
}));
