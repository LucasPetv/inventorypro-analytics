// 🔒 SICHERE PRODUKTIONS-VERSION - Kein Backend-Zugriff!
// Diese Version verwendet nur lokale Demo-Daten ohne externe Verbindungen

interface ProductionMockUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
  is_active: boolean;
}

export class SecureProductionService {
  private isElectron: boolean;
  
  // 🔒 HARDCODED DEMO-ACCOUNTS (Sichere Standalone-Version)
  private readonly DEMO_ACCOUNTS = [
    {
      username: 'admin',
      password: 'admin123',
      user: {
        id: 1,
        username: 'admin',
        email: 'admin@demo.local',
        role: 'admin' as const,
        full_name: 'Demo Administrator',
        is_active: true
      }
    },
    {
      username: 'demo',
      password: 'demo123', 
      user: {
        id: 2,
        username: 'demo',
        email: 'demo@demo.local',
        role: 'user' as const,
        full_name: 'Demo User',
        is_active: true
      }
    }
  ];

  constructor() {
    this.isElectron = typeof window !== 'undefined' && !!window.electronAPI;
    console.log('🔒 Secure Production Service initialized');
    console.log('📊 Demo-only mode - No backend connections');
  }

  async connect(): Promise<void> {
    console.log('🔒 Secure standalone mode - No external connections');
  }

  async disconnect(): Promise<void> {
    console.log('🔒 Secure service disconnected');
  }

  async validateSession(token: string): Promise<ProductionMockUser | null> {
    // Keine persistenten Sessions in Demo-Version
    return null;
  }

  async loginUser(credentials: any): Promise<any> {
    console.log('🔒 Processing demo login (secure standalone)');
    
    // Suche Demo-Account
    const account = this.DEMO_ACCOUNTS.find(
      acc => acc.username === credentials.username && acc.password === credentials.password
    );
    
    if (account) {
      const mode = this.isElectron ? '⚡ Electron' : '🌐 Browser';
      return {
        success: true,
        message: `${mode} Demo Mode - Anmeldung erfolgreich`,
        user: account.user,
        token: `demo-token-${account.user.id}-${Date.now()}`
      };
    }

    return {
      success: false,
      message: '🔒 Demo-Login: Verwenden Sie "admin/admin123" oder "demo/demo123"'
    };
  }

  async registerUser(data: any): Promise<any> {
    return {
      success: false,
      message: '🔒 Registrierung in Demo-Version nicht verfügbar'
    };
  }

  // 🛡️ SCHUTZ: Keine echten Backend-Operationen verfügbar
  async executeQuery(): Promise<any> {
    throw new Error('🔒 Backend-Operationen in Demo-Version deaktiviert');
  }
  
  async connectToDatabase(): Promise<any> {
    throw new Error('🔒 Datenbankzugriff in Demo-Version deaktiviert');
  }
}
