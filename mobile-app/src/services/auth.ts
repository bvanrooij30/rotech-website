import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS, API_BASE_URL } from '../constants/config';
import { User, ApiResponse } from '../types';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class AuthService {
  // Login with email and password
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/mobile/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Inloggen mislukt',
        };
      }

      // Store token and user data
      await SecureStore.setItemAsync(STORAGE_KEYS.authToken, data.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(data.user));

      return {
        success: true,
        data: {
          user: data.user,
          token: data.token,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Kon geen verbinding maken met de server',
      };
    }
  }

  // Register new account
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Registratie mislukt',
        };
      }

      // Auto-login after registration
      if (result.token && result.user) {
        await SecureStore.setItemAsync(STORAGE_KEYS.authToken, result.token);
        await SecureStore.setItemAsync(STORAGE_KEYS.user, JSON.stringify(result.user));

        return {
          success: true,
          data: {
            user: result.user,
            token: result.token,
          },
        };
      }

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: 'Kon geen verbinding maken met de server',
      };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.authToken);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.user);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Get stored user
  async getStoredUser(): Promise<User | null> {
    try {
      const userJson = await SecureStore.getItemAsync(STORAGE_KEYS.user);
      if (userJson) {
        return JSON.parse(userJson);
      }
      return null;
    } catch {
      return null;
    }
  }

  // Get stored token
  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(STORAGE_KEYS.authToken);
    } catch {
      return null;
    }
  }

  // Check if authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }

  // Validate token with server
  async validateSession(): Promise<ApiResponse<User>> {
    try {
      const token = await this.getStoredToken();
      if (!token) {
        return { success: false, error: 'Geen token gevonden' };
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/mobile/session`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // Token invalid, clear storage
        await this.logout();
        return { success: false, error: 'Sessie verlopen' };
      }

      return { success: true, data: data.user };
    } catch (error) {
      console.error('Session validation error:', error);
      return { success: false, error: 'Kon sessie niet valideren' };
    }
  }
}

export const authService = new AuthService();
export default authService;
