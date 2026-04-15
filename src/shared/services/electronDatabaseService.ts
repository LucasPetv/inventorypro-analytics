// Electron-sicherer Database Service für Renderer-Prozess
// Verwendet IPC-Kommunikation mit dem Main-Prozess

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'customer';
  full_name: string;
  company?: string;
  active: boolean;
  last_login?: Date;
}

interface LoginResult {
  success: boolean;
  user?: User;
  message: string;
  permissions?: string[];
}

declare global {
  interface Window {
    electronAPI: {
      database: {
        connect: (config?: DatabaseConfig) => Promise<{ success: boolean; message: string }>;
        disconnect: () => Promise<{ success: boolean; message: string }>;
        authenticateUser: (username: string, password: string, ipAddress?: string, userAgent?: string) => Promise<LoginResult>;
        getAllUsers: () => Promise<User[]>;
        getLoginHistory: (limit?: number) => Promise<any[]>;
      }
    }
  }
}

export class ElectronDatabaseService {
  private isElectron: boolean;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    
    if (!this.isElectron) {
      console.warn('🔄 Not running in Electron - database features disabled');
    }
  }

  async connect(config?: DatabaseConfig): Promise<{ success: boolean; message: string }> {
    if (!this.isElectron) {
      return { success: false, message: 'Nur in Electron verfügbar' };
    }

    try {
      const result = await window.electronAPI.database.connect(config);
      console.log('Database connection result:', result);
      return result;
    } catch (error) {
      console.error('Database connection error:', error);
      return { success: false, message: `Verbindungsfehler: ${error}` };
    }
  }

  async disconnect(): Promise<{ success: boolean; message: string }> {
    if (!this.isElectron) {
      return { success: false, message: 'Nur in Electron verfügbar' };
    }

    try {
      return await window.electronAPI.database.disconnect();
    } catch (error) {
      console.error('Database disconnect error:', error);
      return { success: false, message: `Fehler beim Trennen: ${error}` };
    }
  }

  async authenticateUser(
    username: string, 
    password: string, 
    ipAddress?: string, 
    userAgent?: string
  ): Promise<LoginResult> {
    if (!this.isElectron) {
      return { success: false, message: 'Nur in Electron verfügbar' };
    }

    try {
      const result = await window.electronAPI.database.authenticateUser(
        username, 
        password, 
        ipAddress || 'localhost', 
        userAgent || navigator.userAgent
      );
      console.log('Authentication result:', result);
      return result;
    } catch (error) {
      console.error('Authentication error:', error);
      return { success: false, message: `Anmeldefehler: ${error}` };
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.isElectron) {
      console.warn('getAllUsers: Not running in Electron');
      return [];
    }

    try {
      const users = await window.electronAPI.database.getAllUsers();
      console.log('Users loaded:', users.length);
      return users;
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  async getLoginHistory(limit: number = 20): Promise<any[]> {
    if (!this.isElectron) {
      console.warn('getLoginHistory: Not running in Electron');
      return [];
    }

    try {
      const history = await window.electronAPI.database.getLoginHistory(limit);
      console.log('Login history loaded:', history.length);
      return history;
    } catch (error) {
      console.error('Error loading login history:', error);
      return [];
    }
  }

  // Hilfsmethoden
  isAvailable(): boolean {
    return this.isElectron;
  }

  getConnectionStatus(): string {
    if (!this.isElectron) {
      return 'Nur in Electron Desktop App verfügbar';
    }
    return 'Electron Database Service bereit';
  }
}

export default ElectronDatabaseService;
