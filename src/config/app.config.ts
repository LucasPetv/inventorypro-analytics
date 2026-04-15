/**
 * Application Configuration
 */

export const APP_CONFIG = {
  // App Info
  name: 'InventoryPro Analytics',
  version: '1.0.1',
  description: 'Professional Inventory Analytics & Management',
  
  // Environment Detection
  isElectron: typeof window !== 'undefined' && window.electronAPI,
  isBrowser: typeof window !== 'undefined' && !window.electronAPI,
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // API Settings
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    timeout: 30000,
    retries: 3,
  },
  
  // UI Settings
  ui: {
    theme: 'light',
    defaultLanguage: 'de',
    animationDuration: 200,
    pageSize: 25,
  },
  
  // Feature Flags
  features: {
    darkMode: false,
    advancedAnalytics: true,
    exportFeatures: true,
    databaseManager: true,
    userManagement: false,
  },
  
  // Build Settings
  build: {
    target: process.env.BUILD_TARGET || 'web',
    platform: process.platform,
  }
} as const;

export const getEnvironment = () => {
  if (APP_CONFIG.isElectron) return 'electron';
  if (APP_CONFIG.isBrowser) return 'browser';
  return 'unknown';
};

export const isFeatureEnabled = (feature: keyof typeof APP_CONFIG.features) => {
  return APP_CONFIG.features[feature];
};
