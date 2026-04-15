// Mock Database Service für Browser-Modus
// Simuliert die Database-Funktionalität ohne echte MySQL-Verbindung

interface MockUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  full_name?: string;
  is_active: boolean;
}

export class BrowserMockDatabaseService {
  private isConnected = false;

  async connect(): Promise<void> {
    // Simuliere Connection Delay
    await new Promise(resolve => setTimeout(resolve, 100));
    this.isConnected = true;
    console.log('🌐 Mock Database Service connected (Browser Mode)');
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    console.log('🌐 Mock Database Service disconnected');
  }

  async validateSession(token: string): Promise<MockUser | null> {
    // Mock validation - immer erfolgreich für Demo
    return null; // Keine gespeicherte Session
  }

  async loginUser(credentials: any): Promise<any> {
    // Mock login - immer erfolgreich
    return {
      success: true,
      message: 'Browser Demo Mode',
      user: {
        id: 1,
        username: 'demo',
        email: 'demo@example.com',
        role: 'user',
        full_name: 'Demo User',
        is_active: true
      } as MockUser,
      token: 'demo-token'
    };
  }

  async registerUser(data: any): Promise<any> {
    // Mock registration
    return {
      success: false,
      message: 'Registrierung in Browser-Demo nicht verfügbar'
    };
  }

  // Weitere Mock-Methoden können hier hinzugefügt werden
}

export default BrowserMockDatabaseService;
