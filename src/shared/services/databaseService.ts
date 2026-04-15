import mysql from 'mysql2/promise';
import { AuthService, User, LoginCredentials, RegisterData, AuthResult } from './authService';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
}

// Fehlende LoginResult Interface hinzufügen
interface LoginResult {
  success: boolean;
  message: string;
  user?: User;
  permissions?: string[];
}

export class DatabaseService {
  private connection: mysql.Connection | null = null;
  public config: DatabaseConfig;

  constructor(config: DatabaseConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inventory_db',
    port: 3306
  }) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await mysql.createConnection(this.config);
      console.log('✅ Datenbankverbindung erfolgreich hergestellt');
      
      // Teste die Verbindung
      await this.connection.ping();
    } catch (error) {
      console.error('❌ Fehler bei der Datenbankverbindung:', error);
      throw new Error(`Datenbankverbindung fehlgeschlagen: ${error}`);
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Datenbankverbindung getrennt');
    }
  }

  async initializeTables(): Promise<void> {
    if (!this.connection) {
      throw new Error('Keine Datenbankverbindung');
    }

    // Das vollständige SQL wird aus der database_setup.sql Datei ausgeführt
    console.log('🗄️ Tabellen werden über das SQL-Script initialisiert');
    console.log('📋 Führen Sie database_setup.sql in phpMyAdmin aus');
  }

  // Benutzer-Authentifizierung
  async authenticateUser(username: string, password: string, ipAddress?: string, userAgent?: string): Promise<LoginResult> {
    if (!this.connection) {
      throw new Error('Keine Datenbankverbindung');
    }

    try {
      // Benutzer finden
      const [userRows] = await this.connection.execute(`
        SELECT id, username, email, password_hash, role, full_name, company, active, last_login, 
               login_attempts, locked_until
        FROM users 
        WHERE username = ? AND active = TRUE
      `, [username]) as any[];

      if (userRows.length === 0) {
        await this.logLoginAttempt(username, false, 'Benutzer nicht gefunden', ipAddress, userAgent);
        return { success: false, message: 'Ungültige Anmeldedaten' };
      }

      const user = userRows[0];

      // Prüfe ob Account gesperrt ist
      if (user.locked_until && new Date() < new Date(user.locked_until)) {
        await this.logLoginAttempt(username, false, 'Account gesperrt', ipAddress, userAgent);
        return { success: false, message: 'Account temporär gesperrt. Versuchen Sie es später erneut.' };
      }

      // Hier würden Sie normalerweise das Passwort hashen und vergleichen
      // Für Demo-Zwecke verwenden wir einfache Passwörter
      let validPassword = false;
      if (username === 'admin' && password === 'admin123') validPassword = true;
      if (username === 'demo_kunde' && password === 'kunde123') validPassword = true;

      if (!validPassword) {
        await this.logLoginAttempt(username, false, 'Falsches Passwort', ipAddress, userAgent);
        return { success: false, message: 'Ungültige Anmeldedaten' };
      }

      // Erfolgreiche Anmeldung
      await this.logLoginAttempt(username, true, null, ipAddress, userAgent);
      
      // Benutzer-Berechtigungen laden
      const permissions = await this.getUserPermissions(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          full_name: user.full_name,
          is_active: user.active,
          last_login: user.last_login,
          created_at: user.created_at
        },
        permissions,
        message: 'Anmeldung erfolgreich'
      };

    } catch (error) {
      console.error('Fehler bei der Authentifizierung:', error);
      return { success: false, message: 'Systemfehler bei der Anmeldung' };
    }
  }

  private async logLoginAttempt(username: string, success: boolean, failureReason?: string, ipAddress?: string, userAgent?: string): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.execute(`
        CALL UserLogin(?, ?, ?, ?, ?)
      `, [username, ipAddress || '', userAgent || '', success, failureReason || '']);
    } catch (error) {
      console.error('Fehler beim Protokollieren des Login-Versuchs:', error);
    }
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    if (!this.connection) return [];

    try {
      const [permissionRows] = await this.connection.execute(`
        SELECT p.name 
        FROM permissions p
        JOIN user_permissions up ON p.id = up.permission_id
        WHERE up.user_id = ?
      `, [userId]) as any[];

      return permissionRows.map((row: any) => row.name);
    } catch (error) {
      console.error('Fehler beim Laden der Berechtigungen:', error);
      return [];
    }
  }

  // Session-Management
  async createSession(userId: number, ipAddress?: string, userAgent?: string): Promise<string> {
    if (!this.connection) {
      throw new Error('Keine Datenbankverbindung');
    }

    const sessionToken = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 Stunden

    await this.connection.execute(`
      INSERT INTO user_sessions (user_id, session_token, ip_address, user_agent, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `, [userId, sessionToken, ipAddress || '', userAgent || '', expiresAt]);

    return sessionToken;
  }

  async destroySession(sessionToken: string): Promise<void> {
    if (!this.connection) return;

    await this.connection.execute(`
      UPDATE user_sessions SET active = FALSE WHERE session_token = ?
    `, [sessionToken]);
  }

  // Hilfsfunktionen
  private generateSessionToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15) + 
           Date.now().toString(36);
  }

  // Benutzer-Management (nur für Admins)
  async getAllUsers(): Promise<User[]> {
    if (!this.connection) return [];

    try {
      const [userRows] = await this.connection.execute(`
        SELECT * FROM v_user_overview ORDER BY created_at DESC
      `) as any[];

      return userRows;
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
      return [];
    }
  }

  async getLoginHistory(limit: number = 50): Promise<any[]> {
    if (!this.connection) return [];

    try {
      const [historyRows] = await this.connection.execute(`
        SELECT * FROM login_history ORDER BY login_time DESC LIMIT ?
      `, [limit]) as any[];

      return historyRows;
    } catch (error) {
      console.error('Fehler beim Laden der Login-Historie:', error);
      return [];
    }
  }

  // ========== AUTH METHODS ==========

  // Benutzer registrieren
  async registerUser(registerData: RegisterData): Promise<AuthResult> {
    if (!this.connection) {
      return { success: false, message: 'Keine Datenbankverbindung' };
    }

    try {
      // Eingabe validieren
      const usernameCheck = AuthService.validateUsername(registerData.username);
      if (!usernameCheck.isValid) {
        return { success: false, message: usernameCheck.error || 'Ungültiger Benutzername' };
      }

      if (!AuthService.validateEmail(registerData.email)) {
        return { success: false, message: 'Ungültige E-Mail-Adresse' };
      }

      const passwordCheck = AuthService.validatePasswordStrength(registerData.password);
      if (!passwordCheck.isValid) {
        return { success: false, message: passwordCheck.errors.join(', ') };
      }

      // Prüfe ob Benutzer bereits existiert
      const [existingUsers] = await this.connection.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [registerData.username, registerData.email]
      ) as [any[], any];

      if (existingUsers.length > 0) {
        return { success: false, message: 'Benutzername oder E-Mail bereits vergeben' };
      }

      // Passwort hashen
      const { hash, salt } = await AuthService.hashPassword(registerData.password);

      // Benutzer in Datenbank einfügen
      const [result] = await this.connection.execute(
        `INSERT INTO users (username, email, password_hash, salt, full_name, role) 
         VALUES (?, ?, ?, ?, ?, 'user')`,
        [registerData.username, registerData.email, hash, salt, registerData.full_name || '']
      ) as [mysql.ResultSetHeader, any];

      if (result.affectedRows === 1) {
        // Aktivität loggen
        await this.logUserActivity(result.insertId, 'register');

        // Benutzer-Daten für Response laden
        const user = await this.getUserById(result.insertId);
        if (user) {
          const token = AuthService.generateToken(user);
          await this.createUserSession(user.id, token);
          
          return {
            success: true,
            message: 'Registrierung erfolgreich',
            user,
            token
          };
        }
      }

      return { success: false, message: 'Fehler bei der Registrierung' };
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      return { success: false, message: 'Datenbankfehler bei der Registrierung' };
    }
  }

  // Benutzer anmelden
  async loginUser(credentials: LoginCredentials, userAgent?: string, ipAddress?: string): Promise<AuthResult> {
    if (!this.connection) {
      return { success: false, message: 'Keine Datenbankverbindung' };
    }

    try {
      // Benutzer aus Datenbank laden
      const [users] = await this.connection.execute(
        `SELECT id, username, email, password_hash, full_name, role, is_active, login_attempts 
         FROM users WHERE username = ? OR email = ?`,
        [credentials.username, credentials.username]
      ) as [any[], any];

      if (users.length === 0) {
        return { success: false, message: 'Ungültige Anmeldedaten' };
      }

      const userData = users[0];

      // Prüfe ob Account aktiv ist
      if (!userData.is_active) {
        return { success: false, message: 'Account ist deaktiviert' };
      }

      // Prüfe Rate Limiting
      if (AuthService.isRateLimited(userData.login_attempts)) {
        return { success: false, message: 'Zu viele Fehlversuche. Versuchen Sie es später erneut.' };
      }

      // Passwort verifizieren
      const isPasswordValid = await AuthService.verifyPassword(credentials.password, userData.password_hash);

      if (!isPasswordValid) {
        // Fehlversuche erhöhen
        await this.connection.execute(
          'UPDATE users SET login_attempts = login_attempts + 1 WHERE id = ?',
          [userData.id]
        );

        // Fehlgeschlagenen Login loggen
        await this.logUserActivity(userData.id, 'failed_login', { ip_address: ipAddress, user_agent: userAgent });

        return { success: false, message: 'Ungültige Anmeldedaten' };
      }

      // Erfolgreicher Login - Reset login attempts & update last_login
      await this.connection.execute(
        'UPDATE users SET login_attempts = 0, last_login = NOW() WHERE id = ?',
        [userData.id]
      );

      // Benutzer-Objekt erstellen
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
        last_login: new Date(),
        created_at: userData.created_at
      };

      // JWT Token erstellen
      const token = AuthService.generateToken(user);
      
      // Session in DB speichern
      await this.createUserSession(user.id, token, userAgent, ipAddress);
      
      // Erfolgreichen Login loggen
      await this.logUserActivity(user.id, 'login', { ip_address: ipAddress, user_agent: userAgent });

      return {
        success: true,
        message: 'Anmeldung erfolgreich',
        user,
        token
      };

    } catch (error) {
      console.error('Login-Fehler:', error);
      return { success: false, message: 'Datenbankfehler beim Login' };
    }
  }

  // Benutzer abmelden
  async logoutUser(token: string): Promise<AuthResult> {
    if (!this.connection) {
      return { success: false, message: 'Keine Datenbankverbindung' };
    }

    try {
      const sessionData = AuthService.verifyToken(token);
      if (!sessionData) {
        return { success: false, message: 'Ungültiger Token' };
      }

      const tokenHash = AuthService.hashToken(token);

      // Session deaktivieren
      await this.connection.execute(
        'UPDATE user_sessions SET is_active = FALSE WHERE token_hash = ? AND user_id = ?',
        [tokenHash, sessionData.userId]
      );

      // Logout loggen
      await this.logUserActivity(sessionData.userId, 'logout');

      return { success: true, message: 'Erfolgreich abgemeldet' };
    } catch (error) {
      console.error('Logout-Fehler:', error);
      return { success: false, message: 'Fehler beim Abmelden' };
    }
  }

  // Benutzer nach ID laden
  async getUserById(id: number): Promise<User | null> {
    if (!this.connection) return null;

    try {
      const [users] = await this.connection.execute(
        'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM users WHERE id = ?',
        [id]
      ) as [any[], any];

      if (users.length === 0) return null;

      const userData = users[0];
      return {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
        last_login: userData.last_login,
        created_at: userData.created_at
      };
    } catch (error) {
      console.error('Fehler beim Laden des Benutzers:', error);
      return null;
    }
  }

  // Session erstellen
  private async createUserSession(userId: number, token: string, userAgent?: string, ipAddress?: string): Promise<void> {
    if (!this.connection) return;

    try {
      const tokenHash = AuthService.hashToken(token);
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 Stunden gültig

      await this.connection.execute(
        `INSERT INTO user_sessions (user_id, token_hash, expires_at, user_agent, ip_address) 
         VALUES (?, ?, ?, ?, ?)`,
        [userId, tokenHash, expiresAt, userAgent || '', ipAddress || '']
      );
    } catch (error) {
      console.error('Fehler beim Erstellen der Session:', error);
    }
  }

  // Benutzer-Aktivität loggen
  private async logUserActivity(userId: number, activityType: string, details?: any): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.execute(
        'INSERT INTO user_activity_log (user_id, activity_type, details) VALUES (?, ?, ?)',
        [userId, activityType, details ? JSON.stringify(details) : null]
      );
    } catch (error) {
      console.error('Fehler beim Loggen der Aktivität:', error);
    }
  }

  // Session validieren
  async validateSession(token: string): Promise<User | null> {
    if (!this.connection) return null;

    try {
      const sessionData = AuthService.verifyToken(token);
      if (!sessionData) return null;

      const tokenHash = AuthService.hashToken(token);

      // Prüfe ob Session in DB existiert und aktiv ist
      const [sessions] = await this.connection.execute(
        'SELECT user_id FROM user_sessions WHERE token_hash = ? AND expires_at > NOW() AND is_active = TRUE',
        [tokenHash]
      ) as [any[], any];

      if (sessions.length === 0) return null;

      // Lade Benutzer-Daten
      return await this.getUserById(sessions[0].user_id);
    } catch (error) {
      console.error('Session-Validierungsfehler:', error);
      return null;
    }
  }

  // Alle Sessions eines Benutzers deaktivieren
  async deactivateAllUserSessions(userId: number): Promise<void> {
    if (!this.connection) return;

    try {
      await this.connection.execute(
        'UPDATE user_sessions SET is_active = FALSE WHERE user_id = ?',
        [userId]
      );
    } catch (error) {
      console.error('Fehler beim Deaktivieren der Sessions:', error);
    }
  }
}

export default DatabaseService;
