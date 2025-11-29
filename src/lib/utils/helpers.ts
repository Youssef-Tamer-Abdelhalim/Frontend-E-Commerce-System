/**
 * Get backend URL for images
 * @param path - The image path
 * @param bustCache - Add cache buster to force refresh (default: false)
 */
export function getImageUrl(path: string | undefined, bustCache: boolean = false): string {
  if (!path) return '/images/placeholder.svg';
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://backend-easeshopping-system-production.up.railway.app';
  
  let processedPath = path;
  
  // Handle localhost URLs (convert to production backend)
  if (processedPath.includes('http://localhost:8000/')) {
    processedPath = processedPath.replace('http://localhost:8000/', '');
  }
  if (processedPath.includes('http://localhost:8000')) {
    processedPath = processedPath.replace('http://localhost:8000', '');
  }
  
  // Handle malformed URLs where external URL is embedded in path
  // e.g., "products/https://fakestoreapi.com/img/..."
  if (processedPath.includes('https://') && !processedPath.startsWith('https://')) {
    const httpsIndex = processedPath.indexOf('https://');
    processedPath = processedPath.substring(httpsIndex);
  }
  
  // If it's already a full external URL (not localhost), use it directly
  let url: string;
  if (processedPath.startsWith('http://') || processedPath.startsWith('https://')) {
    url = processedPath;
  } else {
    // Remove leading slash if present
    const cleanPath = processedPath.startsWith('/') ? processedPath.slice(1) : processedPath;
    url = `${backendUrl}/${cleanPath}`;
  }
  
  // Add cache buster if requested
  if (bustCache) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}t=${Date.now()}`;
  }
  
  return url;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Sleep function for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if we're on the client side
 */
export function isClient(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Check if we're on the server side
 */
export function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Get first letter of name for avatar
 */
export function getInitials(name: string): string {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Check if email is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Check if phone is valid (Egyptian format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^01[0125][0-9]{8}$/;
  return phoneRegex.test(phone);
}

/**
 * Get color hex code
 */
export function getColorHex(colorName: string): string {
  const colors: Record<string, string> = {
    black: '#000000',
    white: '#FFFFFF',
    red: '#EF4444',
    green: '#22C55E',
    blue: '#3B82F6',
    yellow: '#EAB308',
    orange: '#F97316',
    purple: '#A855F7',
    pink: '#EC4899',
    gray: '#6B7280',
    silver: '#C0C0C0',
    gold: '#FFD700',
    navy: '#1E3A5F',
    brown: '#8B4513',
    beige: '#F5F5DC',
  };
  
  return colors[colorName.toLowerCase()] || colorName;
}
