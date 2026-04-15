import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Types für Auth-System
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

export class AuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
  private static readonly JWT_EXPIRES_IN = '24h';
  private static readonly SALT_ROUNDS = 12;
  private static readonly MAX_LOGIN_ATTEMPTS = 5;
  
  // Passwort hashen
  static async hashPassword(password: string): Promise<{ hash: string; salt: string }> {
    try {
      const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
      const hash = await bcrypt.hash(password, salt);
      return { hash, salt };
    } catch (error) {
      throw new Error('Fehler beim Hashen des Passworts');
    }
  }

  // Passwort verifizieren
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      console.error('Passwort-Verifikationsfehler:', error);
      return false;
    }
  }

  // JWT Token erstellen
  static generateToken(user: User): string {
    const payload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };

    return jwt.sign(payload, this.JWT_SECRET, { 
      expiresIn: this.JWT_EXPIRES_IN,
      issuer: 'InventoryPro-Analytics'
    });
  }

  // JWT Token verifizieren
  static verifyToken(token: string): SessionData | null {
    try {
      return jwt.verify(token, this.JWT_SECRET) as SessionData;
    } catch (error) {
      console.error('Token-Verifikationsfehler:', error);
      return null;
    }
  }

  // Passwort-Stärke prüfen
  static validatePasswordStrength(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Passwort muss mindestens 8 Zeichen lang sein');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Kleinbuchstaben enthalten');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Passwort muss mindestens einen Großbuchstaben enthalten');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Passwort muss mindestens eine Zahl enthalten');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Passwort muss mindestens ein Sonderzeichen enthalten');
    }

    return { isValid: errors.length === 0, errors };
  }

  // E-Mail Format validieren
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Benutzername validieren
  static validateUsername(username: string): { isValid: boolean; error?: string } {
    if (username.length < 3) {
      return { isValid: false, error: 'Benutzername muss mindestens 3 Zeichen lang sein' };
    }
    
    if (username.length > 50) {
      return { isValid: false, error: 'Benutzername darf maximal 50 Zeichen lang sein' };
    }
    
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { isValid: false, error: 'Benutzername darf nur Buchstaben, Zahlen, Punkte, Bindestriche und Unterstriche enthalten' };
    }
    
    return { isValid: true };
  }

  // Sicherer Session Token für Password Reset
  static generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Rate Limiting Helper
  static isRateLimited(loginAttempts: number): boolean {
    return loginAttempts >= this.MAX_LOGIN_ATTEMPTS;
  }

  // Berechne Lockout-Zeit basierend auf Fehlversuchen
  static getLockoutDuration(attempts: number): number {
    if (attempts < 3) return 0;
    if (attempts < 5) return 5 * 60 * 1000; // 5 Minuten
    if (attempts < 8) return 15 * 60 * 1000; // 15 Minuten
    return 60 * 60 * 1000; // 1 Stunde
  }

  // Session-Daten aus Token extrahieren
  static getSessionFromToken(token: string): User | null {
    const sessionData = this.verifyToken(token);
    if (!sessionData) return null;

    return {
      id: sessionData.userId,
      username: sessionData.username,
      email: '', // Wird von DB-Service gefüllt
      role: sessionData.role as 'admin' | 'user' | 'viewer',
      is_active: true,
      created_at: new Date()
    };
  }

  // Token-Hashing für sichere DB-Speicherung
  static hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  // Sichere Token-Vergleich
  static compareTokens(token: string, hashedToken: string): boolean {
    const hashedInput = this.hashToken(token);
    return crypto.timingSafeEqual(Buffer.from(hashedInput), Buffer.from(hashedToken));
  }
}

// Auth-Middleware für Request-Validierung
export class AuthMiddleware {
  static requireAuth(requiredRole?: 'admin' | 'user' | 'viewer') {
    return (token: string): { authorized: boolean; user?: User; error?: string } => {
      const sessionData = AuthService.verifyToken(token);
      
      if (!sessionData) {
        return { authorized: false, error: 'Ungültiger oder abgelaufener Token' };
      }

      if (requiredRole && sessionData.role !== 'admin' && sessionData.role !== requiredRole) {
        return { authorized: false, error: 'Unzureichende Berechtigung' };
      }

      const user: User = {
        id: sessionData.userId,
        username: sessionData.username,
        email: '', 
        role: sessionData.role as 'admin' | 'user' | 'viewer',
        is_active: true,
        created_at: new Date()
      };

      return { authorized: true, user };
    };
  }
}

export default AuthService;
