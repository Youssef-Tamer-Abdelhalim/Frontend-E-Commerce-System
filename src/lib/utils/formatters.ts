/**
 * Convert Arabic/Eastern numerals to English/Western numerals
 */
function convertToEnglishNumbers(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  const persianNumerals = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  
  let result = str;
  
  // Replace Arabic numerals
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(arabicNumerals[i], 'g'), i.toString());
    result = result.replace(new RegExp(persianNumerals[i], 'g'), i.toString());
  }
  
  return result;
}

/**
 * Format price with currency - always uses English/Western numbers
 */
export function formatPrice(price: number): string {
  // Always use en-US to get English numbers with USD currency
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
  
  return formatted;
}

/**
 * Format date - always uses English/Western numbers
 */
export function formatDate(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  // Use Arabic month names but English numbers
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  // Format with locale for month names, then convert Arabic numerals to English
  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', options).format(d);
  
  // Convert Arabic numerals to English
  return convertToEnglishNumbers(formatted);
}

/**
 * Format date with time - always uses English/Western numbers
 */
export function formatDateTime(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  
  const formatted = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', options).format(d);
  
  // Convert Arabic numerals to English
  return convertToEnglishNumbers(formatted);
}

/**
 * Format relative time (e.g., "2 days ago") - with English numbers
 */
export function formatRelativeTime(date: string | Date, locale: string = 'ar'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar' : 'en', {
    numeric: 'auto',
  });
  
  let result: string;
  
  if (diffInSeconds < 60) {
    result = rtf.format(-diffInSeconds, 'second');
  } else {
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      result = rtf.format(-diffInMinutes, 'minute');
    } else {
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        result = rtf.format(-diffInHours, 'hour');
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
          result = rtf.format(-diffInDays, 'day');
        } else {
          const diffInMonths = Math.floor(diffInDays / 30);
          if (diffInMonths < 12) {
            result = rtf.format(-diffInMonths, 'month');
          } else {
            const diffInYears = Math.floor(diffInMonths / 12);
            result = rtf.format(-diffInYears, 'year');
          }
        }
      }
    }
  }
  
  return convertToEnglishNumbers(result);
}

/**
 * Format number with locale - always uses English/Western numbers
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-EG').format(num);
}

/**
 * Truncate text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Get discount percentage
 */
export function getDiscountPercentage(originalPrice: number, discountedPrice: number): number {
  if (originalPrice <= 0 || discountedPrice >= originalPrice) return 0;
  return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}
