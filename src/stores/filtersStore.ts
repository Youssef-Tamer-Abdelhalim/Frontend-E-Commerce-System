import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SortOption = 
  | '-createdAt' 
  | 'createdAt' 
  | '-price' 
  | 'price' 
  | '-ratingsAverage' 
  | 'ratingsAverage'
  | '-sold';

interface FiltersState {
  keyword: string;
  category: string | null;
  brand: string | null;
  priceMin: number | null;
  priceMax: number | null;
  rating: number | null;
  sort: SortOption;
  page: number;
  limit: number;
}

interface FiltersActions {
  setKeyword: (keyword: string) => void;
  setCategory: (categoryId: string | null) => void;
  setBrand: (brandId: string | null) => void;
  setPriceRange: (min: number | null, max: number | null) => void;
  setRating: (rating: number | null) => void;
  setSort: (sort: SortOption) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  resetFilters: () => void;
  getQueryParams: () => Record<string, string | number>;
}

type FiltersStore = FiltersState & FiltersActions;

const initialState: FiltersState = {
  keyword: '',
  category: null,
  brand: null,
  priceMin: null,
  priceMax: null,
  rating: null,
  sort: '-createdAt',
  page: 1,
  limit: 12,
};

export const useFiltersStore = create<FiltersStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setKeyword: (keyword: string) => {
        set({ keyword, page: 1 });
      },

      setCategory: (categoryId: string | null) => {
        set({ category: categoryId, page: 1 });
      },

      setBrand: (brandId: string | null) => {
        set({ brand: brandId, page: 1 });
      },

      setPriceRange: (min: number | null, max: number | null) => {
        set({ priceMin: min, priceMax: max, page: 1 });
      },

      setRating: (rating: number | null) => {
        set({ rating, page: 1 });
      },

      setSort: (sort: SortOption) => {
        set({ sort, page: 1 });
      },

      setPage: (page: number) => {
        set({ page });
      },

      setLimit: (limit: number) => {
        set({ limit, page: 1 });
      },

      resetFilters: () => {
        set({ ...initialState });
      },

      getQueryParams: () => {
        const state = get();
        const params: Record<string, string | number> = {
          page: state.page,
          limit: state.limit,
          sort: state.sort,
        };

        if (state.keyword) {
          params.keyword = state.keyword;
        }

        if (state.category) {
          params.category = state.category;
        }

        if (state.brand) {
          params.brand = state.brand;
        }

        if (state.priceMin !== null) {
          params['price[gte]'] = state.priceMin;
        }

        if (state.priceMax !== null) {
          params['price[lte]'] = state.priceMax;
        }

        if (state.rating !== null) {
          params['ratingsAverage[gte]'] = state.rating;
        }

        return params;
      },
    }),
    {
      name: 'filters-storage',
      partialize: (state) => ({
        sort: state.sort,
        limit: state.limit,
      }),
    }
  )
);
