import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Required for refreshToken HttpOnly cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to requests
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - Handle errors with retry for 429 and auto-refresh for 401
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: number; _isRetryAfterRefresh?: boolean };
    
    // Handle 429 Too Many Requests - Retry with exponential backoff
    if (error.response?.status === 429 && originalRequest) {
      const retryCount = originalRequest._retry || 0;
      
      if (retryCount < 3) {
        originalRequest._retry = retryCount + 1;
        
        // Wait before retrying (exponential backoff: 1s, 2s, 4s)
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return apiClient(originalRequest);
      }
    }
    
    // Handle 401 Unauthorized - Try to refresh token first
    if (error.response?.status === 401 && originalRequest && !originalRequest._isRetryAfterRefresh) {
      // Don't try to refresh if we're already on an auth endpoint
      const isAuthEndpoint = originalRequest.url?.includes('/auth/');
      
      if (isAuthEndpoint) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue the request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;
      originalRequest._isRetryAfterRefresh = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        
        const newAccessToken = response.data.accessToken;
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', newAccessToken);
        }
        
        processQueue(null, newAccessToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        
        // Refresh failed - clear auth and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('auth-storage');
          // Redirect to login if not already there
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper to create form data for file uploads
export const createFormData = (data: Record<string, unknown>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    
    if (value instanceof File) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item instanceof File) {
          formData.append(key, item);
        } else {
          formData.append(key, String(item));
        }
      });
    } else {
      formData.append(key, String(value));
    }
  });
  
  return formData;
};
