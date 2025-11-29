// API Base URL
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Pagination
export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 48];

// Image placeholders
export const PLACEHOLDER_IMAGE = '/images/placeholder.png';
export const PLACEHOLDER_USER = '/images/placeholder-user.png';

// Sort options
export const SORT_OPTIONS = [
  { value: '-createdAt', labelKey: 'products.newest' },
  { value: 'price', labelKey: 'products.priceLowToHigh' },
  { value: '-price', labelKey: 'products.priceHighToLow' },
  { value: '-ratingsAverage', labelKey: 'products.rating' },
  { value: '-sold', labelKey: 'products.bestSelling' },
] as const;

// User roles
export const USER_ROLES = {
  USER: 'user',
  MANAGER: 'manager',
  ADMIN: 'admin',
} as const;

// Order statuses
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  DELIVERED: 'delivered',
} as const;

// Payment methods
export const PAYMENT_METHODS = {
  CASH: 'cash',
  ONLINE: 'online',
} as const;

// Supported countries for shipping
export const SUPPORTED_COUNTRIES = [
  { code: 'EG', name: 'Egypt', nameAr: 'مصر' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'OM', name: 'Oman', nameAr: 'عُمان' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن' },
] as const;

// Rating options
export const RATING_OPTIONS = [5, 4, 3, 2, 1] as const;

// Animation durations (ms)
export const ANIMATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;
