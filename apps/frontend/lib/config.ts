// API Configuration
export const config = {
  // API Base URL - defaults to localhost:3001 for Node.js backend
  // Set NEXT_PUBLIC_API_BASE_URL in .env.local to override
  API_BASE:
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1',

  // SWR Configuration
  SWR_CONFIG: {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 30000, // 30 seconds
  },

  // Pagination
  TICKETS_PER_PAGE: 10,

  // Auto-refresh interval (in milliseconds)
  AUTO_REFRESH_INTERVAL: 30000,
};

// Environment helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
