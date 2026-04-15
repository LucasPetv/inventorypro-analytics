
import React from 'react';
import { Book, CheckCircle2, FileSpreadsheet, Calculator, Database } from 'lucide-react';

const UserManual: React.FC = () => {
  const steps = [
    {
      title: "1. Login & Sicherheit",
      content: "Melden Sie sich mit Ihren Firmendaten an. Das Tool nutzt ein gesichertes Backend. Ihre Rechenprozesse werden auf geschützten Servern durchgeführt, nicht auf Ihrem lokalen Rechner, um maximale Datensicherheit zu gewährleisten.",
      icon: <Database className="text-indigo-600" />
    },
    {
      title: "2. Daten vorbereiten",
      content: "Stellen Sie sicher, dass Ihre Excel- oder CSV-Datei die Spalten: 'Artikel', 'Menge', 'Preis', 'Verbrauch' und 'Jahr' enthält. Die Trennung sollte über Semikolon (;) erfolgen.",
      icon: <FileSpreadsheet className="text-indigo-600" />
    },
    {
      title: "3. Spalten-Mapping",
      content: "Unter 'Einstellungen' können Sie eigene Spaltennamen definieren, falls Ihre Datei anders benannt ist. Dies ist wichtig für die korrekte Zuordnung im Backend.",
      icon: <Calculator className="text-indigo-600" />
    },
    {
      title: "4. Analyse & Export",
      content: "Nach dem Upload berechnet das System automatisch die EOQ (Andler-Formel), Sicherheitsbestände und führt eine ABC-Analyse durch. Das Jahr 2026 wird automatisch prognostiziert.",
      icon: <CheckCircle2 className="text-indigo-600" />
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 animate-in zoom-in-95 duration-500">
      <div className="text-center mb-16">
        <div className="inline-flex p-4 bg-indigo-50 rounded-3xl text-indigo-600 mb-6">
          <Book size={40} />
        </div>
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">Benutzerhandbuch</h2>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Erfahren Sie, wie Sie das Maximum aus InventoryPro herausholen und Ihre Lagerhaltung optimieren.
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex gap-8 items-start group hover:border-indigo-200 transition-colors">
            <div className="bg-slate-50 p-6 rounded-3xl group-hover:scale-110 transition-transform">
              {step.icon}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{step.title}</h3>
              <p className="text-slate-500 leading-relaxed">{step.content}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 bg-slate-900 rounded-[40px] p-12 text-white overflow-hidden relative">
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-6">Formeln im Backend</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm opacity-80 leading-relaxed">
            <div>
              <p className="font-bold text-indigo-400 mb-2">Andler-Formel (EOQ)</p>
              <p>√ ( (200 * Jahresverbrauch * Bestellkosten) / (Lagerkostensatz * Preis) )</p>
            </div>
            <div>
              <p className="font-bold text-indigo-400 mb-2">Sicherheitsbestand</p>
              <p>Standardmäßig auf 10% der optimalen Bestellmenge gesetzt zur Pufferung von Schwankungen.</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-20 -mt-20 blur-3xl" />
      </div>
    </div>
  );
};

export default UserManual;
