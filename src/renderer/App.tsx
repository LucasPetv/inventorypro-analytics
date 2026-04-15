import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from '../components/Dashboard';
import AnalyticsTable from '../components/AnalyticsTable';
import { AppView } from '../shared/types';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [data, setData] = useState([]);

  const handleLogin = (credentials: { username: string; password: string }) => {
    console.log('Login-Versuch:', credentials);
    
    // Demo-Benutzer setzen
    setCurrentUser({
      username: credentials.username,
      role: credentials.username === 'admin' ? 'admin' : 'user'
    });
    
    setIsLoggedIn(true);
    console.log('✅ Anmeldung erfolgreich, App wird geladen...');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setCurrentView(AppView.DASHBOARD);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Lager-Analyse</h1>
              <span className="ml-3 text-sm text-gray-600">
                Angemeldet als: {currentUser?.username}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView(AppView.DASHBOARD)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === AppView.DASHBOARD ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView(AppView.ANALYTICS)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === AppView.ANALYTICS ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {currentView === AppView.DASHBOARD && <Dashboard data={data} />}
        {currentView === AppView.ANALYTICS && <AnalyticsTable data={data} />}
      </main>
    </div>
  );
};

export default App;