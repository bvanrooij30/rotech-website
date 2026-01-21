// API Configuration
// Change this to your production URL when deploying
export const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.100:3000' // Your local network IP for development
  : 'https://ro-techdevelopment.com';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  login: '/api/auth/callback/credentials',
  register: '/api/auth/register',
  logout: '/api/auth/signout',
  session: '/api/auth/session',
  
  // Portal
  dashboard: '/api/portal/dashboard',
  products: '/api/portal/products',
  account: '/api/portal/account',
  password: '/api/portal/account/password',
  
  // Support
  tickets: '/api/support/tickets',
  ticketDetail: (id: string) => `/api/support/tickets/${id}`,
  ticketReply: (id: string) => `/api/support/tickets/${id}/reply`,
  
  // Subscriptions
  subscription: '/api/portal/subscription',
  
  // Invoices
  invoices: '/api/portal/invoices',
};

// App configuration
export const APP_CONFIG = {
  appName: 'Ro-Tech Portal',
  version: '1.0.0',
  supportEmail: 'support@ro-techdevelopment.com',
  supportPhone: '+31 6 57 23 55 74',
  websiteUrl: 'https://ro-techdevelopment.com',
};

// Storage keys
export const STORAGE_KEYS = {
  authToken: 'auth_token',
  refreshToken: 'refresh_token',
  user: 'user_data',
  onboarded: 'has_onboarded',
};
