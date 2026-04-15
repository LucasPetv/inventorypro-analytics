import React, { useState, useEffect } from 'react';

// Minimal Auth Service
class SimpleAuth {
  login(username: string, password: string) {
    const users = {
      'demo': { password: 'demo123', role: 'demo' },
      'admin': { password: 'admin123', role: 'admin' }
    };
    
    if (users[username] && users[username].password === password) {
      return {
        success: true,
        user: { username, role: users[username].role },
        token: 'token_' + Date.now()
      };
    }
    return { success: false, error: 'Ungültige Anmeldedaten' };
  }
}

// Minimal Login Component
const MinimalLogin = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const authService = new SimpleAuth();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    setTimeout(() => {
      const result = authService.login(username, password);
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        padding: '32px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: '#4f46e5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px',
            color: 'white'
          }}>
            🛡️
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
            InventoryPro Analytics
          </h1>
          <p style={{ color: '#6b7280', marginTop: '8px' }}>Bitte melden Sie sich an</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Benutzername
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Benutzername eingeben"
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Passwort
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Passwort eingeben"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              color: '#dc2626',
              fontSize: '14px',
              marginBottom: '16px'
            }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? '🔄 Anmeldung...' : '🚀 Anmelden'}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f9fafb',
          borderRadius: '8px'
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#374151', margin: '0 0 8px 0' }}>
            Demo-Zugänge:
          </h3>
          <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>
            <div>admin / admin123</div>
            <div>demo / demo123</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Minimal Dashboard
const MinimalDashboard = ({ user, onLogout }: { user: any, onLogout: () => void }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, Arial, sans-serif'
    }}>
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
          InventoryPro Analytics
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#6b7280', fontSize: '14px' }}>
            Willkommen, {user.username}! ({user.role})
          </span>
          <button
            onClick={onLogout}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Abmelden
          </button>
        </div>
      </header>
      
      <main style={{ padding: '24px' }}>
        <div style={{
          background: 'white',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '24px', color: '#1f2937', marginBottom: '16px' }}>
            🎉 Willkommen bei InventoryPro Analytics!
          </h2>
          <p style={{ fontSize: '16px', color: '#6b7280', marginBottom: '24px' }}>
            Die Anwendung wurde erfolgreich von einer Electron Desktop-App zu einer Web-Anwendung umgestellt
            und läuft jetzt vollständig im Browser auf GitHub Pages.
          </p>
          
          <div style={{ 
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <h3 style={{ color: '#166534', fontSize: '18px', marginBottom: '8px' }}>
              ✅ Erfolgreich umgestellt:
            </h3>
            <ul style={{ color: '#166534', marginLeft: '20px' }}>
              <li>Electron-Code entfernt</li>
              <li>SQL-Datenbank durch Web-kompatible Lösung ersetzt</li>
              <li>Authentifizierung vereinfacht</li>
              <li>GitHub Pages Deployment konfiguriert</li>
              <li>Vollständig browserbasiert</li>
            </ul>
          </div>

          <div style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '16px'
          }}>
            <h3 style={{ color: '#374151', fontSize: '16px', marginBottom: '8px' }}>
              🔗 Nützliche Links:
            </h3>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              <p>
                📂 <strong>Repository:</strong>{' '}
                <a href="https://github.com/LucasPetv/inventorypro-analytics" 
                   style={{ color: '#4f46e5' }}>
                  GitHub Repository
                </a>
              </p>
              <p>
                🌐 <strong>Live-Demo:</strong>{' '}
                <a href="https://lucaspetv.github.io/inventorypro-analytics" 
                   style={{ color: '#4f46e5' }}>
                  InventoryPro Analytics
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

// Main App
const MinimalApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 MinimalApp: Checking authentication...');
    // Check for stored auth
    const token = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        console.log('✅ User restored from localStorage');
      } catch (error) {
        console.warn('Failed to restore user from localStorage');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (loggedInUser: any) => {
    console.log('✅ User logged in:', loggedInUser);
    setUser(loggedInUser);
    localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
    localStorage.setItem('auth_token', 'token_' + Date.now());
  };

  const handleLogout = () => {
    console.log('👋 User logged out');
    setUser(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8fafc',
        fontFamily: 'Inter, Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔄</div>
          <p style={{ color: '#6b7280' }}>Lade InventoryPro Analytics...</p>
        </div>
      </div>
    );
  }

  console.log('🎯 MinimalApp: Rendering with user:', user);

  if (!user) {
    return <MinimalLogin onLogin={handleLogin} />;
  }

  return <MinimalDashboard user={user} onLogout={handleLogout} />;
};

export default MinimalApp;
