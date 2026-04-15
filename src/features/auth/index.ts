/**
 * Auth Feature Exports
 */

// Components
export { default as AuthPortal } from './components/AuthPortal';
export { default as Login } from './components/Login';

// Services
export { BrowserAuthService, type User, type LoginCredentials, type RegisterData, type AuthResult } from './services/browserAuthService';
export { AuthService } from './services/authService';

// Types
export interface AuthFeatureProps {
  onLoginSuccess: (username: string, token: string, user: any) => void;
  databaseService?: any;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: any | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
