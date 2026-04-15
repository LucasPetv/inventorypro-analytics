
import React, { useState } from 'react';
import { ColumnMapping } from '../types';
import { InventoryService } from '../services/inventoryService';
import { LayoutGrid, Save, ShieldCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface SettingsViewProps {
  mapping: ColumnMapping;
  setMapping: (m: ColumnMapping) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ mapping, setMapping }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (field: keyof ColumnMapping, value: string) => {
    setMapping({ ...mapping, [field]: value });
    setSaveStatus('idle'); // Reset status when changes are made
  };

  const saveToServer = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setStatusMessage('');

    try {
      // Echter Server-Call über InventoryService
      const response = await InventoryService.saveSettings(mapping);
      
      if (response.success) {
        setSaveStatus('success');
        setStatusMessage(response.message);
        console.log('Settings saved successfully:', response);
      } else {
        setSaveStatus('error');
        setStatusMessage(response.message);
        console.error('Server error:', response);
      }
    } catch (error) {
      setSaveStatus('error');
      setStatusMessage('Unerwarteter Fehler beim Speichern der Einstellungen.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white p-10 rounded-[40px] shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-10">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
            <LayoutGrid size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">System-Einstellungen</h3>
            <p className="text-slate-400">Konfigurieren Sie das Daten-Interface zum Backend.</p>
          </div>
        </div>

        <div className="space-y-6">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Spalten-Mapping (Quell-Datei)</h4>
          
          {Object.entries(mapping).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">
                {key === 'Artikel' ? 'Artikel-Bezeichnung' : key}
              </label>
              <input
                type="text"
                value={value}
                onChange={(e) => handleChange(key as keyof ColumnMapping, e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-5 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-slate-600"
                placeholder={`${key} Spaltenname`}
              />
            </div>
          ))}

          <div className="pt-10 border-t border-slate-100 space-y-4">
            <button 
              onClick={saveToServer}
              disabled={isSaving}
              className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg active:scale-[0.98] ${
                isSaving 
                  ? 'bg-gray-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Speichere auf Server...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Konfiguration im Server speichern
                </>
              )}
            </button>

            {/* Status-Anzeige */}
            {saveStatus !== 'idle' && (
              <div className={`p-4 rounded-2xl flex items-center gap-3 ${
                saveStatus === 'success' 
                  ? 'bg-green-50 text-green-800' 
                  : 'bg-red-50 text-red-800'
              }`}>
                {saveStatus === 'success' ? (
                  <CheckCircle2 size={20} className="text-green-600" />
                ) : (
                  <AlertCircle size={20} className="text-red-600" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {saveStatus === 'success' ? 'Erfolgreich gespeichert!' : 'Fehler beim Speichern'}
                  </p>
                  <p className="text-xs opacity-75">{statusMessage}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
              <ShieldCheck size={14} />
              Änderungen werden verschlüsselt in der Datenbank abgelegt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
