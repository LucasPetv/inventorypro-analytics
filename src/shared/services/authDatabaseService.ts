import mysql from 'mysql2/promise';
import { AuthService, User, LoginCredentials, RegisterData, AuthResult } from './authService';

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
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
      
      // Erstelle Standard-Tabellen
      await this.initializeTables();
    } catch (error) {
      console.error('❌ Datenbankverbindung fehlgeschlagen:', error);
      throw new Error('Datenbankverbindung fehlgeschlagen');
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
      console.log('🔌 Datenbankverbindung getrennt');
    }
  }

  private async initializeTables(): Promise<void> {
    if (!this.connection) return;

    console.log('🗄️ Tabellen werden über das SQL-Script initialisiert');
    console.log('📋 Führen Sie database_users_setup.sql in phpMyAdmin aus');
  }

  async initializeDefaultUsers(): Promise<void> {
    if (!this.connection) {
      throw new Error('Keine Datenbankverbindung');
    }

    try {
      // Standard-Admin-Benutzer erstellen
      const defaultUsers = [
        {
          username: 'admin',
          password: 'admin123', // In Production: sicheres Passwort!
          email: 'admin@company.com',
          role: 'admin',
          is_active: 1
        },
        {
          username: 'user',
          password: 'user123',
          email: 'user@company.com', 
          role: 'user',
          is_active: 1
        }
      ];

      for (const user of defaultUsers) {
        // Prüfen ob Benutzer bereits existiert
        const [existing] = await this.connection.execute(
          'SELECT id FROM users WHERE username = ?',
          [user.username]
        ) as any[];

        if (existing.length === 0) {
          // Passwort hashen (einfache Version für Demo)
          const hashedPassword = this.hashPassword(user.password);
          
          await this.connection.execute(
            'INSERT INTO users (username, password_hash, email, role, is_active, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [user.username, hashedPassword, user.email, user.role, user.is_active]
          );
          
          console.log(`✅ Standard-Benutzer '${user.username}' erstellt`);
        }
      }
    } catch (error) {
      console.error('Fehler beim Erstellen der Standard-Benutzer:', error);
    }
  }

  private hashPassword(password: string): string {
    // Einfacher Hash für Demo - in Production: bcrypt verwenden!
    return Buffer.from(password).toString('base64');
  }

  private verifyPassword(password: string, hash: string): boolean {
    const passwordHash = this.hashPassword(password);
    return passwordHash === hash;
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

  // Passwort ändern
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<AuthResult> {
    if (!this.connection) {
      return { success: false, message: 'Keine Datenbankverbindung' };
    }

    try {
      // Passwort-Stärke prüfen
      const passwordCheck = AuthService.validatePasswordStrength(newPassword);
      if (!passwordCheck.isValid) {
        return { success: false, message: passwordCheck.errors.join(', ') };
      }

      // Aktueller Benutzer und Passwort laden
      const [users] = await this.connection.execute(
        'SELECT password_hash FROM users WHERE id = ?',
        [userId]
      ) as [any[], any];

      if (users.length === 0) {
        return { success: false, message: 'Benutzer nicht gefunden' };
      }

      // Aktuelles Passwort verifizieren
      const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, users[0].password_hash);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Aktuelles Passwort ist falsch' };
      }

      // Neues Passwort hashen
      const { hash, salt } = await AuthService.hashPassword(newPassword);

      // Passwort in DB aktualisieren
      await this.connection.execute(
        'UPDATE users SET password_hash = ?, salt = ? WHERE id = ?',
        [hash, salt, userId]
      );

      // Alle Sessions deaktivieren (Benutzer muss sich neu anmelden)
      await this.deactivateAllUserSessions(userId);

      // Aktivität loggen
      await this.logUserActivity(userId, 'password_change');

      return { success: true, message: 'Passwort erfolgreich geändert' };
    } catch (error) {
      console.error('Passwort-Änderungsfehler:', error);
      return { success: false, message: 'Fehler beim Ändern des Passworts' };
    }
  }

  // Admin: Alle Benutzer auflisten
  async getAllUsers(): Promise<User[]> {
    if (!this.connection) return [];

    try {
      const [users] = await this.connection.execute(
        'SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM users ORDER BY created_at DESC'
      ) as [any[], any];

      return users.map((userData: any) => ({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: userData.role,
        is_active: userData.is_active,
        last_login: userData.last_login,
        created_at: userData.created_at
      }));
    } catch (error) {
      console.error('Fehler beim Laden aller Benutzer:', error);
      return [];
    }
  }

  // Admin: Benutzer deaktivieren/aktivieren
  async toggleUserStatus(userId: number, isActive: boolean): Promise<AuthResult> {
    if (!this.connection) {
      return { success: false, message: 'Keine Datenbankverbindung' };
    }

    try {
      await this.connection.execute(
        'UPDATE users SET is_active = ? WHERE id = ?',
        [isActive, userId]
      );

      if (!isActive) {
        await this.deactivateAllUserSessions(userId);
      }

      return { 
        success: true, 
        message: `Benutzer ${isActive ? 'aktiviert' : 'deaktiviert'}` 
      };
    } catch (error) {
      console.error('Fehler beim Ändern des Benutzerstatus:', error);
      return { success: false, message: 'Fehler beim Ändern des Benutzerstatus' };
    }
  }
}

export default DatabaseService;
