import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Lock, 
  Mail, 
  UserPlus, 
  LogIn, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle, 
  Shield,
  ArrowRight
} from 'lucide-react';
import { BrowserAuthService, RegisterData, LoginCredentials, AuthResult } from '../services/browserAuthService';
import BrowserCompatibleDatabaseService from '../../../shared/services/browserCompatibleDatabaseService';

interface AuthPortalProps {
  onLoginSuccess: (username: string, token: string, user: any) => void;
  databaseService: BrowserCompatibleDatabaseService;
}

type AuthMode = 'login' | 'register' | 'forgot';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  general?: string;
}

const AuthPortal: React.FC<AuthPortalProps> = ({ onLoginSuccess, databaseService }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string>('');
  
  // Form States
  const [loginData, setLoginData] = useState<LoginCredentials>({
    username: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    full_name: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Password Strength
  const [passwordStrength, setPasswordStrength] = useState({ isValid: false, errors: [] as string[] });
  
  const formRef = useRef<HTMLFormElement>(null);

  // Reset form when mode changes
  useEffect(() => {
    setErrors({});
    setSuccess('');
    setLoginData({ username: '', password: '' });
    setRegisterData({ username: '', email: '', password: '', full_name: '' });
    setConfirmPassword('');
    setPasswordStrength({ isValid: false, errors: [] });
  }, [mode]);

  // Validate password strength in real-time for register mode
  useEffect(() => {
    if (mode === 'register' && registerData.password) {
      const strength = BrowserAuthService.validatePasswordStrength(registerData.password);
      setPasswordStrength(strength);
    }
  }, [registerData.password, mode]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (mode === 'login') {
      if (!loginData.username.trim()) {
        newErrors.username = 'Benutzername ist erforderlich';
      }
      if (!loginData.password) {
        newErrors.password = 'Passwort ist erforderlich';
      }
    } else if (mode === 'register') {
      // Username validation
      const usernameCheck = BrowserAuthService.validateUsername(registerData.username);
      if (!usernameCheck.isValid) {
        newErrors.username = usernameCheck.error;
      }

      // Email validation
      if (!registerData.email.trim()) {
        newErrors.email = 'E-Mail-Adresse ist erforderlich';
      } else if (!BrowserAuthService.validateEmail(registerData.email)) {
        newErrors.email = 'Ungültige E-Mail-Adresse';
      }

      // Password validation
      if (!registerData.password) {
        newErrors.password = 'Passwort ist erforderlich';
      } else if (!passwordStrength.isValid) {
        newErrors.password = 'Passwort erfüllt nicht die Sicherheitsanforderungen';
      }

      // Confirm password validation
      if (!confirmPassword) {
        newErrors.confirmPassword = 'Passwort-Bestätigung ist erforderlich';
      } else if (registerData.password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwörter stimmen nicht überein';
      }

      // Full name validation
      if (!registerData.full_name?.trim()) {
        newErrors.fullName = 'Vollständiger Name ist erforderlich';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await databaseService.loginUser(loginData);
      
      if (result.success && result.user && result.token) {
        setSuccess('Anmeldung erfolgreich!');
        setTimeout(() => {
          onLoginSuccess(result.user!.username, result.token!, result.user);
        }, 500);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      setErrors({ general: 'Ein unerwarteter Fehler ist aufgetreten' });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      const result = await databaseService.registerUser(registerData);
      
      if (result.success) {
        setSuccess('Registrierung erfolgreich! Sie können sich jetzt anmelden.');
        setTimeout(() => {
          setMode('login');
          setLoginData({ username: registerData.username, password: '' });
        }, 2000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      console.error('Registrierungsfehler:', error);
      setErrors({ general: 'Ein unerwarteter Fehler ist aufgetreten' });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!registerData.password) return 'bg-gray-200';
    if (passwordStrength.errors.length > 3) return 'bg-red-500';
    if (passwordStrength.errors.length > 1) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthWidth = () => {
    if (!registerData.password) return '0%';
    const strength = Math.max(0, (5 - passwordStrength.errors.length) / 5 * 100);
    return `${strength}%`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">InventoryPro Analytics</h1>
            <p className="text-blue-100 mt-2">
              {mode === 'login' && 'Willkommen zurück'}
              {mode === 'register' && 'Neues Konto erstellen'}
              {mode === 'forgot' && 'Passwort zurücksetzen'}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
              <CheckCircle className="w-5 h-5" />
              {success}
            </div>
          )}

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              {errors.general}
            </div>
          )}

          {/* Login Form */}
          {mode === 'login' && (
            <form ref={formRef} onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benutzername oder E-Mail
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={loginData.username}
                    onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="benutzername oder email@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Ihr Passwort"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Anmelden
                  </>
                )}
              </button>
            </form>
          )}

          {/* Register Form */}
          {mode === 'register' && (
            <form ref={formRef} onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vollständiger Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.full_name}
                    onChange={(e) => setRegisterData({ ...registerData, full_name: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Max Mustermann"
                    disabled={loading}
                  />
                </div>
                {errors.fullName && <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benutzername
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={registerData.username}
                    onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.username ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="benutzername"
                    disabled={loading}
                  />
                </div>
                {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-Mail-Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                    disabled={loading}
                  />
                </div>
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Sicheres Passwort"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {/* Password Strength Indicator */}
                {registerData.password && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                        style={{ width: getPasswordStrengthWidth() }}
                      />
                    </div>
                    {passwordStrength.errors.length > 0 && (
                      <div className="mt-1 text-xs text-red-600">
                        <ul className="list-disc list-inside">
                          {passwordStrength.errors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Passwort wiederholen"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={loading || !passwordStrength.isValid}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-green-700 hover:to-emerald-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <UserPlus className="w-5 h-5" />
                    Konto erstellen
                  </>
                )}
              </button>
            </form>
          )}

          {/* Mode Switch */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            {mode === 'login' ? (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Noch kein Konto?{' '}
                  <button
                    onClick={() => setMode('register')}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    disabled={loading}
                  >
                    Hier registrieren
                  </button>
                </p>
              </div>
            ) : (
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Bereits ein Konto?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                    disabled={loading}
                  >
                    Hier anmelden
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPortal;
