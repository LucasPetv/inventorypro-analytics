
import React, { useState } from 'react';
import { Database, Lock, User, ShieldCheck } from 'lucide-react';
import Logo from '../../../shared/components/Logo';

interface LoginProps {
  onLogin: (user: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && password) {
      onLogin(username);
    } else {
      setError('Bitte Benutzername und Passwort eingeben.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Logo size="large" showText={true} className="text-white" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm flex items-center gap-3">
              <Lock size={16} />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Benutzername</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="Name eingeben"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 ml-1">Passwort</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transform active:scale-[0.98] transition-all shadow-lg shadow-indigo-200"
          >
            Anmelden
          </button>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
            <ShieldCheck size={14} />
            SSL Verschlüsselte Serververbindung aktiv
          </div>
        </form>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Noch kein Konto? <span className="text-indigo-400 cursor-pointer hover:underline">Administrator kontaktieren</span>
        </p>
      </div>
    </div>
  );
};

export default Login;
