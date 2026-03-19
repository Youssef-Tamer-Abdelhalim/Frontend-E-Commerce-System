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

// Supported countries for shipping (matches backend March 2026 update)
export const SUPPORTED_COUNTRIES = [
  { code: 'AD', name: 'Andorra', nameAr: 'أندورا' },
  { code: 'AT', name: 'Austria', nameAr: 'النمسا' },
  { code: 'AU', name: 'Australia', nameAr: 'أستراليا' },
  { code: 'AZ', name: 'Azerbaijan', nameAr: 'أذربيجان' },
  { code: 'BA', name: 'Bosnia and Herzegovina', nameAr: 'البوسنة والهرسك' },
  { code: 'BE', name: 'Belgium', nameAr: 'بلجيكا' },
  { code: 'BG', name: 'Bulgaria', nameAr: 'بلغاريا' },
  { code: 'BH', name: 'Bahrain', nameAr: 'البحرين' },
  { code: 'BR', name: 'Brazil', nameAr: 'البرازيل' },
  { code: 'BY', name: 'Belarus', nameAr: 'بيلاروسيا' },
  { code: 'CA', name: 'Canada', nameAr: 'كندا' },
  { code: 'CH', name: 'Switzerland', nameAr: 'سويسرا' },
  { code: 'CN', name: 'China', nameAr: 'الصين' },
  { code: 'CZ', name: 'Czech Republic', nameAr: 'التشيك' },
  { code: 'DE', name: 'Germany', nameAr: 'ألمانيا' },
  { code: 'DK', name: 'Denmark', nameAr: 'الدنمارك' },
  { code: 'DO', name: 'Dominican Republic', nameAr: 'جمهورية الدومينيكان' },
  { code: 'DZ', name: 'Algeria', nameAr: 'الجزائر' },
  { code: 'EE', name: 'Estonia', nameAr: 'إستونيا' },
  { code: 'EG', name: 'Egypt', nameAr: 'مصر' },
  { code: 'ES', name: 'Spain', nameAr: 'إسبانيا' },
  { code: 'FI', name: 'Finland', nameAr: 'فنلندا' },
  { code: 'FR', name: 'France', nameAr: 'فرنسا' },
  { code: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة' },
  { code: 'GR', name: 'Greece', nameAr: 'اليونان' },
  { code: 'HR', name: 'Croatia', nameAr: 'كرواتيا' },
  { code: 'HT', name: 'Haiti', nameAr: 'هايتي' },
  { code: 'HU', name: 'Hungary', nameAr: 'المجر' },
  { code: 'ID', name: 'Indonesia', nameAr: 'إندونيسيا' },
  { code: 'IL', name: 'Israel', nameAr: 'إسرائيل' },
  { code: 'IN', name: 'India', nameAr: 'الهند' },
  { code: 'IR', name: 'Iran', nameAr: 'إيران' },
  { code: 'IS', name: 'Iceland', nameAr: 'آيسلندا' },
  { code: 'IT', name: 'Italy', nameAr: 'إيطاليا' },
  { code: 'JO', name: 'Jordan', nameAr: 'الأردن' },
  { code: 'JP', name: 'Japan', nameAr: 'اليابان' },
  { code: 'KE', name: 'Kenya', nameAr: 'كينيا' },
  { code: 'KR', name: 'South Korea', nameAr: 'كوريا الجنوبية' },
  { code: 'KW', name: 'Kuwait', nameAr: 'الكويت' },
  { code: 'LI', name: 'Liechtenstein', nameAr: 'ليختنشتاين' },
  { code: 'LK', name: 'Sri Lanka', nameAr: 'سريلانكا' },
  { code: 'LT', name: 'Lithuania', nameAr: 'ليتوانيا' },
  { code: 'LU', name: 'Luxembourg', nameAr: 'لوكسمبورغ' },
  { code: 'LV', name: 'Latvia', nameAr: 'لاتفيا' },
  { code: 'MT', name: 'Malta', nameAr: 'مالطا' },
  { code: 'MX', name: 'Mexico', nameAr: 'المكسيك' },
  { code: 'MY', name: 'Malaysia', nameAr: 'ماليزيا' },
  { code: 'NL', name: 'Netherlands', nameAr: 'هولندا' },
  { code: 'NO', name: 'Norway', nameAr: 'النرويج' },
  { code: 'NP', name: 'Nepal', nameAr: 'نيبال' },
  { code: 'NZ', name: 'New Zealand', nameAr: 'نيوزيلندا' },
  { code: 'OM', name: 'Oman', nameAr: 'عُمان' },
  { code: 'PL', name: 'Poland', nameAr: 'بولندا' },
  { code: 'PR', name: 'Puerto Rico', nameAr: 'بورتوريكو' },
  { code: 'PT', name: 'Portugal', nameAr: 'البرتغال' },
  { code: 'QA', name: 'Qatar', nameAr: 'قطر' },
  { code: 'RO', name: 'Romania', nameAr: 'رومانيا' },
  { code: 'RU', name: 'Russia', nameAr: 'روسيا' },
  { code: 'SA', name: 'Saudi Arabia', nameAr: 'السعودية' },
  { code: 'SE', name: 'Sweden', nameAr: 'السويد' },
  { code: 'SG', name: 'Singapore', nameAr: 'سنغافورة' },
  { code: 'SI', name: 'Slovenia', nameAr: 'سلوفينيا' },
  { code: 'SK', name: 'Slovakia', nameAr: 'سلوفاكيا' },
  { code: 'TH', name: 'Thailand', nameAr: 'تايلاند' },
  { code: 'TN', name: 'Tunisia', nameAr: 'تونس' },
  { code: 'TW', name: 'Taiwan', nameAr: 'تايوان' },
  { code: 'UA', name: 'Ukraine', nameAr: 'أوكرانيا' },
  { code: 'US', name: 'United States', nameAr: 'الولايات المتحدة' },
  { code: 'ZA', name: 'South Africa', nameAr: 'جنوب أفريقيا' },
  { code: 'ZM', name: 'Zambia', nameAr: 'زامبيا' },
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
