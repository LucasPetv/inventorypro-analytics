import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, Users, Shield, Activity, Settings, AlertTriangle } from 'lucide-react';
import { ElectronDatabaseService } from '../../../shared/services/electronDatabaseService';

interface DatabaseManagerProps {
  onUserLogin?: (user: any) => void;
}

const DatabaseManager: React.FC<DatabaseManagerProps> = ({ onUserLogin }) => {
  const [dbService] = useState(new ElectronDatabaseService());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('Nicht verbunden');
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'inventory_db',
    port: 3306
  });
  const [showConfig, setShowConfig] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [loginHistory, setLoginHistory] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'connection' | 'users' | 'history'>('connection');

  const connectToDatabase = async () => {
    setIsConnecting(true);
    setConnectionStatus('Verbindung wird hergestellt...');
    
    try {
      const result = await dbService.connect(dbConfig);
      
      if (result.success) {
        setIsConnected(true);
        setConnectionStatus('✅ Verbunden mit inventory_db (Benutzer-Management)');
        
        // Benutzer und History laden
        await loadUsers();
        await loadLoginHistory();
      } else {
        setIsConnected(false);
        setConnectionStatus(`❌ Verbindung fehlgeschlagen: ${result.message}`);
      }
    } catch (error) {
      setIsConnected(false);
      setConnectionStatus(`❌ Verbindung fehlgeschlagen: ${error}`);
      console.error('Database connection error:', error);
    }
    
    setIsConnecting(false);
  };

  const disconnectFromDatabase = async () => {
    try {
      await dbService.disconnect();
      setIsConnected(false);
      setConnectionStatus('Verbindung getrennt');
      setUsers([]);
      setLoginHistory([]);
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const loadUsers = async () => {
    if (!isConnected) return;

    try {
      const userList = await dbService.getAllUsers();
      setUsers(userList);
    } catch (error) {
      console.error('Fehler beim Laden der Benutzer:', error);
    }
  };

  const loadLoginHistory = async () => {
    if (!isConnected) return;

    try {
      const history = await dbService.getLoginHistory(20);
      setLoginHistory(history);
    } catch (error) {
      console.error('Fehler beim Laden der Login-Historie:', error);
    }
  };

  const testLogin = async (username: string, password: string) => {
    if (!isConnected) {
      alert('Keine Datenbankverbindung');
      return;
    }

    try {
      setConnectionStatus('Anmeldung wird getestet...');
      const result = await dbService.authenticateUser(username, password, 'localhost', 'Test Browser');
      
      if (result.success && result.user) {
        setConnectionStatus(`✅ Anmeldung erfolgreich: ${result.user.full_name} (${result.user.role})`);
        if (onUserLogin) {
          onUserLogin(result.user);
        }
        await loadLoginHistory(); // Historie aktualisieren
      } else {
        setConnectionStatus(`❌ Anmeldung fehlgeschlagen: ${result.message}`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Anmeldungsfehler: ${error}`);
    }
  };

  // Prüfe ob Electron verfügbar ist
  const isElectronAvailable = dbService.isAvailable();

  return (
    <div className="space-y-6">
      {/* Electron-Warnung */}
      {!isElectronAvailable && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-amber-600" size={20} />
            <div>
              <h4 className="font-semibold text-amber-800">Nur in Electron verfügbar</h4>
              <p className="text-sm text-amber-700">
                Die Datenbankfunktionen sind nur in der Desktop-App verfügbar. 
                Starten Sie die App mit <code className="bg-amber-100 px-1 rounded">npm run electron-dev</code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab-Navigation */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Database size={20} />
            Benutzer-Datenbank {!isElectronAvailable && '(Desktop-Modus erforderlich)'}
          </h3>
          <button
            onClick={() => setShowConfig(!showConfig)}
            disabled={!isElectronAvailable}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <Settings size={20} />
          </button>
        </div>

        {/* Tab-Buttons */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'connection', label: 'Verbindung', icon: <Wifi size={16} /> },
            { id: 'users', label: 'Benutzer', icon: <Users size={16} /> },
            { id: 'history', label: 'Login-Historie', icon: <Activity size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Verbindungs-Tab */}
        {activeTab === 'connection' && (
          <div className="space-y-4">
            {/* Konfiguration */}
            {showConfig && (
              <div className="bg-slate-50 p-4 rounded-2xl space-y-4">
                <h4 className="font-semibold text-slate-700">Datenbankeinstellungen</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Host</label>
                    <input
                      type="text"
                      value={dbConfig.host}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="localhost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Port</label>
                    <input
                      type="number"
                      value={dbConfig.port}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, port: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3306"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Benutzername</label>
                    <input
                      type="text"
                      value={dbConfig.user}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, user: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="root"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Passwort</label>
                    <input
                      type="password"
                      value={dbConfig.password}
                      onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Passwort"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Verbindungsstatus */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
              {isConnected ? (
                <Wifi className="text-green-500" size={20} />
              ) : (
                <WifiOff className="text-red-500" size={20} />
              )}
              <div className="flex-1">
                <p className={`font-medium ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
                  {isConnected ? 'Verbunden' : 'Nicht verbunden'}
                </p>
                <p className="text-sm text-slate-600">{connectionStatus}</p>
              </div>
            </div>

            {/* Verbindungs-Buttons */}
            <div className="grid grid-cols-1 gap-4">
              {!isConnected ? (
                <button
                  onClick={connectToDatabase}
                  disabled={isConnecting}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Database size={18} />
                  {isConnecting ? 'Verbindung wird hergestellt...' : 'Verbindung herstellen'}
                </button>
              ) : (
                <button
                  onClick={disconnectFromDatabase}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <WifiOff size={18} />
                  Verbindung trennen
                </button>
              )}
            </div>

            {/* Test-Anmeldungen */}
            {isConnected && (
              <div className="bg-blue-50 p-4 rounded-2xl">
                <h4 className="font-semibold text-blue-800 mb-3">Test-Anmeldungen</h4>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => testLogin('admin', 'admin123')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Shield size={16} />
                    Admin Login
                  </button>
                  <button
                    onClick={() => testLogin('demo_kunde', 'kunde123')}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Users size={16} />
                    Kunde Login
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Benutzer-Tab */}
        {activeTab === 'users' && isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-700">Registrierte Benutzer ({users.length})</h4>
              <button
                onClick={loadUsers}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Aktualisieren
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Benutzername</th>
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Rolle</th>
                    <th className="text-left p-2">Firma</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Letzter Login</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2 font-medium">{user.username}</td>
                      <td className="p-2">{user.full_name}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.role === 'admin' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="p-2">{user.company || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {user.active ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleString('de-DE') 
                          : 'Nie'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Login-Historie Tab */}
        {activeTab === 'history' && isConnected && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-slate-700">Login-Versuche (letzte 20)</h4>
              <button
                onClick={loadLoginHistory}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
              >
                Aktualisieren
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Zeit</th>
                    <th className="text-left p-2">Benutzer</th>
                    <th className="text-left p-2">IP-Adresse</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Grund</th>
                  </tr>
                </thead>
                <tbody>
                  {loginHistory.map((entry, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-2 text-slate-600">
                        {new Date(entry.login_time).toLocaleString('de-DE')}
                      </td>
                      <td className="p-2 font-medium">{entry.username}</td>
                      <td className="p-2 text-slate-600">{entry.ip_address || '-'}</td>
                      <td className="p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          entry.success 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {entry.success ? 'Erfolgreich' : 'Fehlgeschlagen'}
                        </span>
                      </td>
                      <td className="p-2 text-slate-600">{entry.failure_reason || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Informations-Box */}
      <div className="bg-slate-900 text-white p-6 rounded-3xl">
        <h4 className="font-semibold mb-3 text-slate-200">Datenbank-Tabellen (inventory_db)</h4>
        <div className="text-sm text-slate-300 space-y-1">
          <p>• <strong>users</strong> - Benutzerkonten (Admin & Kunden)</p>
          <p>• <strong>user_sessions</strong> - Login-Sessions</p>
          <p>• <strong>login_history</strong> - Anmeldungs-Protokoll</p>
          <p>• <strong>permissions</strong> - Berechtigungen</p>
          <p>• <strong>user_permissions</strong> - Benutzer-Berechtigungen</p>
        </div>
        
        <div className="mt-4 p-3 bg-slate-800 rounded-lg">
          <p className="text-xs text-slate-400 mb-2">Standard-Anmeldedaten:</p>
          <p className="text-sm"><strong>Admin:</strong> admin / admin123</p>
          <p className="text-sm"><strong>Kunde:</strong> demo_kunde / kunde123</p>
        </div>
      </div>
    </div>
  );
};

export default DatabaseManager;
