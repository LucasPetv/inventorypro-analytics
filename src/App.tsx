import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  BarChart3, 
  Settings, 
  BookOpen, 
  LogOut,
  ChevronRight,
  Database,
  ShieldCheck,
  AlertCircle,
  User
} from 'lucide-react';

// Types
import { InventoryRow, CalculatedKPIs, AppView, ColumnMapping } from './shared/types';

// Features
import { AuthPortal } from './features/auth';
import { Dashboard } from './features/dashboard';
import { AnalyticsTable } from './features/analytics';
import { DataInput, DatabaseManager } from './features/data-management';
import { SettingsView } from './features/settings';

// Shared Components
import { Logo, UserManual } from './shared';

// Services
import { InventoryService } from './features/data-management/services/inventoryService';
import BrowserCompatibleDatabaseService from './shared/services/browserCompatibleDatabaseService';
import { SecureProductionService } from './shared/services/secureProductionService';

// Config
import { APP_CONFIG, getEnvironment, isFeatureEnabled } from './config/app.config';
import { AUTH_CONFIG, getDemoUsers } from './config/auth.config';

const App: React.FC = () => {
  // Environment detection
  const environment = getEnvironment();
  const isElectron = environment === 'electron';
  const isBrowser = environment === 'browser';

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // App state
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [inventoryData, setInventoryData] = useState<InventoryRow[]>([]);
  const [calculatedKPIs, setCalculatedKPIs] = useState<CalculatedKPIs[]>([]);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    artikelnummer: null,
    bezeichnung: null,
    kategorie: null,
    lagerbestand: null,
    einkaufspreis: null,
    verkaufspreis: null,
    umsatzMenge12M: null,
    letzteBestellung: null,
  });

  // Services
  const databaseService = useMemo(() => {
    if (isElectron) {
      // Electron version would use native database
      return new BrowserCompatibleDatabaseService();
    } else {
      return new BrowserCompatibleDatabaseService();
    }
  }, [isElectron]);

  // Authentication handlers
  const handleLoginSuccess = useCallback((username: string, token: string, user: any) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    setAuthToken(token);
    console.log(`✅ User ${username} logged in successfully in ${environment} mode`);
  }, [environment]);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setAuthToken(null);
    setCurrentView('dashboard');
    console.log('User logged out');
  }, []);

  // Data handlers
  const handleDataLoaded = useCallback((data: InventoryRow[], mapping: ColumnMapping) => {
    setInventoryData(data);
    setColumnMapping(mapping);
    
    const kpis = InventoryService.calculateKPIs(data, mapping);
    setCalculatedKPIs(kpis);
    
    console.log(`✅ Data loaded: ${data.length} items, KPIs calculated`);
  }, []);

  // Navigation
  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      enabled: true 
    },
    { 
      id: 'data-input', 
      label: 'Datenimport', 
      icon: FileUp, 
      enabled: true 
    },
    { 
      id: 'analytics', 
      label: 'Analysetabelle', 
      icon: BarChart3, 
      enabled: inventoryData.length > 0 
    },
    { 
      id: 'database', 
      label: 'Datenverwaltung', 
      icon: Database, 
      enabled: isFeatureEnabled('databaseManager') 
    },
    { 
      id: 'settings', 
      label: 'Einstellungen', 
      icon: Settings, 
      enabled: true 
    },
    { 
      id: 'manual', 
      label: 'Benutzerhandbuch', 
      icon: BookOpen, 
      enabled: true 
    },
  ];

  // Render main content based on current view
  const renderMainContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={calculatedKPIs} />;
      
      case 'data-input':
        return (
          <DataInput
            onDataLoaded={handleDataLoaded}
            currentMapping={columnMapping}
          />
        );
      
      case 'analytics':
        return <AnalyticsTable data={calculatedKPIs} />;
      
      case 'database':
        if (!isFeatureEnabled('databaseManager')) {
          return <div className="p-8 text-center">Feature nicht verfügbar</div>;
        }
        return <DatabaseManager />;
      
      case 'settings':
        return (
          <SettingsView
            currentMapping={columnMapping}
            onMappingChange={setColumnMapping}
          />
        );
      
      case 'manual':
        return <UserManual />;
      
      default:
        return <Dashboard data={calculatedKPIs} />;
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <AuthPortal
          onLoginSuccess={handleLoginSuccess}
          databaseService={databaseService}
        />
      </div>
    );
  }

  // Main application interface
  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200 flex flex-col">
        {/* Logo Header */}
        <div className="p-6 border-b border-slate-200">
          <Logo />
        </div>

        {/* User Info */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">
                {currentUser?.username || 'Benutzer'}
              </div>
              <div className="text-xs text-slate-500 flex items-center">
                <ShieldCheck className="w-3 h-3 mr-1" />
                {environment.charAt(0).toUpperCase() + environment.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const isDisabled = !item.enabled;
            
            return (
              <button
                key={item.id}
                onClick={() => item.enabled && setCurrentView(item.id as AppView)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25' 
                    : isDisabled
                      ? 'text-slate-400 cursor-not-allowed'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-white' : ''}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </button>
            );
          })}
        </nav>

        {/* Environment Warning (Demo Mode) */}
        {isBrowser && (
          <div className="p-4 m-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-xs">
                <div className="font-medium text-amber-800">Demo-Modus</div>
                <div className="text-amber-700 mt-1">
                  Keine echte Datenbankverbindung
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="font-medium">Abmelden</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {navigationItems.find(item => item.id === currentView)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {APP_CONFIG.description} • Version {APP_CONFIG.version}
              </p>
            </div>
            
            {inventoryData.length > 0 && (
              <div className="flex items-center space-x-4 text-sm text-slate-600">
                <span>📦 {inventoryData.length.toLocaleString()} Artikel</span>
                <span>📊 {calculatedKPIs.length.toLocaleString()} KPI-Datensätze</span>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
