/**
 * Authentication Configuration
 */

export const AUTH_CONFIG = {
  // JWT Settings
  jwt: {
    secret: process.env.JWT_SECRET || 'your-fallback-secret-key',
    expiresIn: '24h',
    issuer: 'inventory-pro-analytics',
    audience: 'inventory-users',
  },
  
  // Password Requirements
  password: {
    minLength: 6,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
    saltRounds: 12,
  },
  
  // Demo Credentials
  demo: {
    users: [
      { username: 'demo', password: 'demo123', role: 'user' },
      { username: 'admin', password: 'admin123', role: 'admin' }
    ]
  },
  
  // Session Settings
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    rememberMe: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
} as const;

export const getDemoUsers = () => AUTH_CONFIG.demo.users;
