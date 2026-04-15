/**
 * Database Configuration
 */

export const DATABASE_CONFIG = {
  // Development
  development: {
    host: 'localhost',
    port: 3306,
    database: 'inventory_analytics_dev',
    connectionLimit: 10,
    timeout: 30000,
  },
  
  // Production
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    database: process.env.DB_NAME || 'inventory_analytics',
    connectionLimit: 20,
    timeout: 60000,
  },
  
  // Demo Mode
  demo: {
    enabled: true,
    mockData: true,
    persistData: false,
  }
} as const;

export const getCurrentDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  return DATABASE_CONFIG[env as keyof typeof DATABASE_CONFIG] || DATABASE_CONFIG.development;
};
