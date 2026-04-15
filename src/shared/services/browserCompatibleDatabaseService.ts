// Browser-kompatible Version des Auth Database Service
// Verwendet Mock-Implementation für Browser

interface MockUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
  is_active: boolean;
}

export default class BrowserCompatibleDatabaseService {
  private isElectron: boolean;

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    console.log(this.isElectron ? '⚡ Electron mode detected' : '🌐 Browser mode detected');
  }

  async connect(): Promise<void> {
    if (this.isElectron) {
      console.log('⚡ Electron database connection would be initialized here');
    } else {
      console.log('🌐 Browser mock database connected');
    }
  }

  async disconnect(): Promise<void> {
    console.log(this.isElectron ? '⚡ Electron database disconnected' : '🌐 Browser mock database disconnected');
  }

  async validateSession(token: string): Promise<MockUser | null> {
    // Keine Session-Wiederherstellung in Browser/Mock
    return null;
  }

  async loginUser(credentials: any): Promise<any> {
    if (this.isElectron) {
      // ⚡ ELECTRON: Verwende eingebaute Demo-Authentifizierung (SICHER)
      // Nur vordefinierte Demo-Accounts, kein Backend-Zugriff
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          success: true,
          message: '⚡ Electron Demo Mode - Admin-Anmeldung erfolgreich',
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@inventorypro.local',
            role: 'admin',
            full_name: 'Demo Administrator',
            is_active: true
          } as MockUser,
          token: 'electron-admin-demo-token'
        };
      } else if (credentials.username === 'demo' && credentials.password === 'demo123') {
        return {
          success: true,
          message: '⚡ Electron Demo Mode - Benutzer-Anmeldung erfolgreich',
          user: {
            id: 2,
            username: 'demo',
            email: 'demo@inventorypro.local',
            role: 'user',
            full_name: 'Demo User',
            is_active: true
          } as MockUser,
          token: 'electron-user-demo-token'
        };
      } else {
        return {
          success: false,
          message: '⚡ Electron Demo: Verwenden Sie "admin/admin123" oder "demo/demo123"'
        };
      }
    } else {
      // Browser Mock - Demo-Anmeldedaten akzeptieren
      if (credentials.username === 'demo' && credentials.password === 'demo123') {
        return {
          success: true,
          message: '🌐 Browser Demo Mode - Anmeldung erfolgreich',
          user: {
            id: 1,
            username: 'demo',
            email: 'demo@example.com',
            role: 'user',
            full_name: 'Demo User',
            is_active: true
          } as MockUser,
          token: 'browser-demo-token'
        };
      } else if (credentials.username === 'admin' && credentials.password === 'admin123') {
        return {
          success: true,
          message: '🌐 Browser Demo Mode - Admin-Anmeldung erfolgreich',
          user: {
            id: 2,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
            full_name: 'Admin User',
            is_active: true
          } as MockUser,
          token: 'browser-admin-demo-token'
        };
      }
      
      return {
        success: false,
        message: '🌐 Browser Demo: Verwenden Sie "demo/demo123" oder "admin/admin123"'
      };
    }
  }

  async registerUser(data: any): Promise<any> {
    return {
      success: false,
      message: this.isElectron ? 
        'Registrierung in Electron noch nicht implementiert' : 
        '🌐 Registrierung in Browser-Demo nicht verfügbar'
    };
  }
}
