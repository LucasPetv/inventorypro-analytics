export interface User {
  id: string;
  username: string;
  role: 'admin' | 'demo';
  email: string;
}

// Hardcoded user credentials
const USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin123',
    user: {
      id: 'admin',
      username: 'admin',
      role: 'admin',
      email: 'admin@inventorypro.com'
    }
  },
  demo: {
    password: 'demo123',
    user: {
      id: 'demo',
      username: 'demo',
      role: 'demo',
      email: 'demo@inventorypro.com'
    }
  }
};

export class SimpleAuthService {
  /**
   * Authenticate user with username/password
   */
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; token?: string; error?: string }> {
    try {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const userRecord = USERS[username.toLowerCase()];
      
      if (!userRecord || userRecord.password !== password) {
        return {
          success: false,
          error: 'Ungültige Anmeldedaten'
        };
      }

      // Generate simple session token
      const token = btoa(JSON.stringify({
        userId: userRecord.user.id,
        timestamp: Date.now(),
        role: userRecord.user.role
      }));

      return {
        success: true,
        user: userRecord.user,
        token
      };
    } catch (error) {
      return {
        success: false,
        error: 'Anmeldung fehlgeschlagen'
      };
    }
  }

  /**
   * Validate existing session token
   */
  async validateSession(token: string): Promise<User | null> {
    try {
      const decoded = JSON.parse(atob(token));
      const userRecord = Object.values(USERS).find(u => u.user.id === decoded.userId);
      
      if (!userRecord) {
        return null;
      }

      // Check if token is not too old (24 hours)
      const tokenAge = Date.now() - decoded.timestamp;
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      
      if (tokenAge > maxAge) {
        return null;
      }

      return userRecord.user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    // For simple auth, just remove from localStorage
    localStorage.removeItem('auth_token');
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | null {
    const userRecord = USERS[username.toLowerCase()];
    return userRecord ? userRecord.user : null;
  }

  /**
   * Get available users (for demo purposes)
   */
  getAvailableUsers(): { username: string; role: string }[] {
    return Object.keys(USERS).map(username => ({
      username,
      role: USERS[username].user.role
    }));
  }
}
