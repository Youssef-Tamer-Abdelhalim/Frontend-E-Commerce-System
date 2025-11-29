import { create } from 'zustand';
import { Product } from '@/types';
import { wishlistApi } from '@/lib/api';

interface WishlistState {
  items: string[]; // Product IDs
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

interface WishlistActions {
  fetchWishlist: () => Promise<void>;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  resetWishlist: () => void;
}

type WishlistStore = WishlistState & WishlistActions;

const initialState: WishlistState = {
  items: [],
  products: [],
  isLoading: false,
  error: null,
};

export const useWishlistStore = create<WishlistStore>()((set, get) => ({
  ...initialState,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await wishlistApi.get();
      const products = response.data;
      const items = products.map((p) => p._id);
      set({ products, items, isLoading: false });
    } catch {
      set({ ...initialState, isLoading: false });
    }
  },

  addToWishlist: async (productId: string) => {
    // Optimistic update
    const previousItems = get().items;
    set({ items: [...previousItems, productId] });

    try {
      await wishlistApi.add(productId);
      // Refetch to get full product data
      await get().fetchWishlist();
    } catch (error: unknown) {
      // Revert on error
      set({ items: previousItems });
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في إضافة المنتج للمفضلة';
      set({ error: errorMessage });
      throw error;
    }
  },

  removeFromWishlist: async (productId: string) => {
    // Optimistic update
    const previousItems = get().items;
    const previousProducts = get().products;
    set({
      items: previousItems.filter((id) => id !== productId),
      products: previousProducts.filter((p) => p._id !== productId),
    });

    try {
      await wishlistApi.remove(productId);
    } catch (error: unknown) {
      // Revert on error
      set({ items: previousItems, products: previousProducts });
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'فشل في حذف المنتج من المفضلة';
      set({ error: errorMessage });
      throw error;
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.includes(productId);
  },

  resetWishlist: () => {
    set({ ...initialState });
  },
}));
