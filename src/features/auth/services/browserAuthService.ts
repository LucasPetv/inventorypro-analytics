// Browser-kompatible Version des Auth Service
// Verwendet Web Crypto API statt Node.js crypto und jwt

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user' | 'viewer';
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  error?: string;
}

export interface SessionData {
  userId: number;
  username: string;
  role: string;
  iat: number;
  exp: number;
}

export class BrowserAuthService {
  private static readonly JWT_SECRET = 'browser-demo-secret';
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly MAX_LOGIN_ATTEMPTS = 5;

  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (!username || username.length < 3) {
      return { isValid: false, error: 'Benutzername muss mindestens 3 Zeichen lang sein' };
    }
    if (username.length > 50) {
      return { isValid: false, error: 'Benutzername darf maximal 50 Zeichen lang sein' };
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return { isValid: false, error: 'Benutzername darf nur Buchstaben, Zahlen, _ und - enthalten' };
    }
    return { isValid: true };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!password || password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    // Browser-Mock: In echten Anwendungen würden Sie Web Crypto API verwenden
    const salt = Math.random().toString(36).substring(2, 15);
    const hash = btoa(salt + password); // Einfacher Base64 für Demo
    
    return { hash, salt };
  }

  static async comparePassword(password: string, hash: string, salt: string): Promise<boolean> {
    // Browser-Mock: Einfacher Vergleich für Demo
    const expectedHash = btoa(salt + password);
    return expectedHash === hash;
  }

  static generateToken(user: User): string {
    // Browser-Mock: Einfacher Token für Demo
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 Stunden
    };
    
    return btoa(JSON.stringify(payload));
  }

  static verifyToken(token: string): SessionData | null {
    try {
      const decoded = JSON.parse(atob(token));
      
      // Prüfe ob Token abgelaufen ist
      if (decoded.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }
      
      return decoded as SessionData;
    } catch {
      return null;
    }
  }

  static generateSecureRandomString(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    if (window.crypto && window.crypto.getRandomValues) {
      // Verwende Web Crypto API falls verfügbar
      const array = new Uint8Array(length);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += chars[array[i] % chars.length];
      }
    } else {
      // Fallback für ältere Browser
      for (let i = 0; i < length; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    
    return result;
  }

  static sanitizeInput(input: string): string {
    return input
      .trim()
      .replace(/[<>\"'&]/g, '') // Entferne gefährliche Zeichen
      .substring(0, 255); // Begrenze Länge
  }

  static isStrongPassword(password: string): boolean {
    return this.validatePasswordStrength(password).isValid;
  }

  static hashPasswordSync(password: string): string {
    // Synchrone Browser-Version für Demos
    return btoa(password + 'demo-salt');
  }
}

// Export für Kompatibilität mit vorhandenem Code
export const AuthService = BrowserAuthService;
