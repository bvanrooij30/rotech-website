// User types
export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  companyName?: string;
  role: 'customer' | 'admin';
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Product types
export interface Product {
  id: string;
  name: string;
  type: 'website' | 'webshop' | 'webapp' | 'api';
  description?: string;
  domain?: string;
  status: 'development' | 'active' | 'maintenance' | 'archived';
  launchDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Subscription types
export interface Subscription {
  id: string;
  planType: 'basis' | 'business' | 'premium';
  planName: string;
  monthlyPrice: number;
  status: 'active' | 'paused' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  hoursIncluded: number;
  hoursUsed: number;
}

// Support ticket types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  category: 'general' | 'technical' | 'billing' | 'feature-request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  productId?: string;
  product?: Product;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export interface TicketMessage {
  id: string;
  senderType: 'customer' | 'support' | 'ai' | 'system';
  senderName: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Invoice types
export interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  description?: string;
  dueDate?: string;
  paidAt?: string;
  pdfUrl?: string;
  createdAt: string;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard stats
export interface DashboardStats {
  activeProducts: number;
  activeSubscription: Subscription | null;
  openTickets: number;
  recentProducts: Product[];
  recentTickets: SupportTicket[];
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  TicketDetail: { ticketId: string };
  NewTicket: undefined;
  ProductDetail: { productId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Support: undefined;
  Settings: undefined;
};
