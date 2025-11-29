import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface UIState {
  isMobileMenuOpen: boolean;
  isCartDrawerOpen: boolean;
  isSearchOpen: boolean;
  toasts: Toast[];
}

interface UIActions {
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleCartDrawer: () => void;
  closeCartDrawer: () => void;
  toggleSearch: () => void;
  closeSearch: () => void;
  showToast: (message: string, type?: ToastType) => void;
  hideToast: (id: string) => void;
}

type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()((set, get) => ({
  // State
  isMobileMenuOpen: false,
  isCartDrawerOpen: false,
  isSearchOpen: false,
  toasts: [],

  // Actions
  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },

  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },

  toggleCartDrawer: () => {
    set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen }));
  },

  closeCartDrawer: () => {
    set({ isCartDrawerOpen: false });
  },

  toggleSearch: () => {
    set((state) => ({ isSearchOpen: !state.isSearchOpen }));
  },

  closeSearch: () => {
    set({ isSearchOpen: false });
  },

  showToast: (message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type };
    
    set((state) => ({ toasts: [...state.toasts, toast] }));

    // Auto remove after 5 seconds
    setTimeout(() => {
      get().hideToast(id);
    }, 5000);
  },

  hideToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
