import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  BarChart3, 
  BookOpen, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  User
} from 'lucide-react';
import { InventoryRow, CalculatedKPIs, AppView, ColumnMapping } from './types';
import { InventoryService } from './services/inventoryService';
import Dashboard from './components/Dashboard';
import DataInput from './components/DataInput';
import AnalyticsTable from './components/AnalyticsTable';
import UserManual from './components/UserManual';
import Logo from './components/Logo';
import AuthPortal from './components/AuthPortal';
import { SimpleAuthService, User as AuthUser } from './services/simpleAuthService';

const App: React.FC = () => {
  // Simple authentication service
  const [authService] = useState(() => new SimpleAuthService());

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);

  // App State
  const [activeView, setActiveView] = useState<AppView>(AppView.DASHBOARD);
  const [data, setData] = useState<CalculatedKPIs[]>([]);
  const [rawData, setRawData] = useState<InventoryRow[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    Artikel: 'Artikel',
    Istbestand: 'Istbestand',
    Inventurergebnis: 'Inventurergebnis',
    Preis: 'Preis',
    Verbrauch: 'Verbrauch',
    Jahr: 'Jahr'
  });

  // Session validation on app start
  useEffect(() => {
    const validateExistingSession = async () => {
      const savedToken = localStorage.getItem('auth_token');
      if (savedToken) {
        try {
          const user = await authService.validateSession(savedToken);
          if (user) {
            setCurrentUser(user);
            setAuthToken(savedToken);
            setIsAuthenticated(true);
            console.log('✅ Session restored for user:', user.username);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Session validation failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
    };

    validateExistingSession();
  }, [authService]);

  const handleLogin = (username: string, token: string, user: AuthUser) => {
    setCurrentUser(user);
    setAuthToken(token);
    setIsAuthenticated(true);
    localStorage.setItem('auth_token', token);
    console.log('✅ Login successful:', username);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('auth_token');
    setActiveView(AppView.DASHBOARD);
    console.log('👋 User logged out');
  };

  // Data processing
  const processInventoryData = useCallback((inventoryData: InventoryRow[]) => {
    setIsProcessing(true);
    try {
      InventoryService.calculateAll(inventoryData).then(kpis => {
        setData(kpis);
        setRawData(inventoryData);
        console.log(`✅ Processed ${kpis.length} inventory items`);
        setIsProcessing(false);
      }).catch(error => {
        console.error('Error processing inventory data:', error);
        setIsProcessing(false);
      });
    } catch (error) {
      console.error('Error processing inventory data:', error);
      setIsProcessing(false);
    }
  }, [columnMapping]);

  // Memoized calculations
  const totalItems = useMemo(() => data.length, [data]);
  const totalValue = useMemo(() => 
    data.reduce((sum, item) => sum + item.bestandswert, 0), [data]
  );
  const avgTurnover = useMemo(() => 
    data.length > 0 ? data.reduce((sum, item) => sum + item.umschlagshaeufigkeit, 0) / data.length : 0, 
    [data]
  );

  // Show auth portal if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthPortal 
        onLoginSuccess={handleLogin}
        authService={authService}
      />
    );
  }

  // Navigation items
  const navigationItems = [
    { id: AppView.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: AppView.DATA_INPUT, label: 'Daten Import', icon: FileUp },
    { id: AppView.ANALYTICS, label: 'Analytics', icon: BarChart3 },
    { id: AppView.USER_MANUAL, label: 'Handbuch', icon: BookOpen }
  ];

  const renderActiveView = () => {
    switch (activeView) {
      case AppView.DASHBOARD:
        return <Dashboard data={data} />;
      case AppView.DATA_INPUT:
        return (
          <DataInput 
            onDataProcessed={processInventoryData}
            isProcessing={isProcessing}
            columnMapping={columnMapping}
            onColumnMappingChange={setColumnMapping}
          />
        );
      case AppView.ANALYTICS:
        return <AnalyticsTable data={data} />;
      case AppView.USER_MANUAL:
        return <UserManual />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-slate-200">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-100">
          <Logo size="medium" showText={true} className="text-slate-800" />
        </div>

        {/* User Section */}
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
              <User size={20} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">
                {currentUser?.full_name || currentUser?.username || 'Demo User'}
              </p>
              <p className="text-xs text-slate-500 capitalize">
                {currentUser?.role || 'user'}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm">{item.label}</span>
                  {isActive && <ChevronRight size={16} className="ml-auto" />}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Stats Section */}
        <div className="p-4 border-t border-slate-100 mt-auto">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-2">Schnellübersicht</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Artikel:</span>
                <span className="font-semibold">{totalItems.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Gesamtwert:</span>
                <span className="font-semibold">€{totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Ø Umschlag:</span>
                <span className="font-semibold">{avgTurnover.toFixed(1)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
          >
            <LogOut size={16} />
            Abmelden
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {navigationItems.find(item => item.id === activeView)?.label || 'Dashboard'}
              </h1>
            </div>
            
            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              {isProcessing && (
                <div className="flex items-center gap-2 text-indigo-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                  <span className="text-sm">Verarbeite...</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck size={16} />
                <span className="text-sm">verbunden</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

// Export Komponente  
export default App;
