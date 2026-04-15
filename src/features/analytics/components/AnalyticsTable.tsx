
import React, { useState, useMemo } from 'react';
import { CalculatedKPIs } from '../types';
import { Download, Search, Filter, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AnalyticsTableProps {
  data: CalculatedKPIs[];
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [yearFilter, setYearFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = item.Artikel.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesYear = yearFilter === 'all' || item.Jahr.toString() === yearFilter;
      return matchesSearch && matchesYear;
    });
  }, [data, searchTerm, yearFilter]);

  const years = useMemo(() => {
    const uniqueYears = [...new Set(data.map(d => d.Jahr.toString()))].sort().reverse();
    return uniqueYears;
  }, [data]);

  const handleExport = () => {
    try {
      // 1. Hauptdaten mit gerundeten Werten (2 Nachkommastellen) - nach Artikel gruppiert
      const artikelMap = new Map();
      
      // Gruppiere nach Artikel
      filteredData.forEach(item => {
        if (!artikelMap.has(item.Artikel)) {
          artikelMap.set(item.Artikel, []);
        }
        artikelMap.get(item.Artikel).push(item);
      });

      // Sortiere Artikel alphabetisch und Jahre innerhalb jedes Artikels
      const exportData = [];
      Array.from(artikelMap.keys()).sort().forEach(artikel => {
        const artikelItems = artikelMap.get(artikel).sort((a, b) => a.Jahr - b.Jahr);
        
        artikelItems.forEach(item => {
          exportData.push({
            'Artikel': item.Artikel,
            'Jahr': item.Jahr,
            'Istbestand': Math.round(item.Istbestand * 100) / 100,
            'Inventurergebnis': Math.round(item.Inventurergebnis * 100) / 100,
            'Preis': Math.round(item.Preis * 100) / 100,
            'Verbrauch': Math.round(item.Verbrauch * 100) / 100,
            'Bestandswert': Math.round(item.bestandswert * 100) / 100,
            'Durchschn. Lagerbestand': Math.round(item.avgLagerbestand * 100) / 100,
            'Umschlagshäufigkeit': Math.round(item.umschlagshaeufigkeit * 100) / 100,
            'Durchschn. Lagerdauer': Math.round(item.avgLagerdauer * 100) / 100,
            'Kapitalbindungskosten': Math.round(item.kapitalbindungskosten * 100) / 100,
            'Verbrauchswert': Math.round(item.verbrauchswert * 100) / 100,
            'ABC-Klasse': item.abcKlasse
          });
        });
      });

      // 2. ABC-Historie: Zeigt ABC-Klassen pro Jahr in Spalten
      const abcHistorie = [];
      const historieMap = new Map();
      
      // Sammle alle verfügbaren Jahre
      const alleJahre = [...new Set(filteredData.map(d => d.Jahr))].sort();
      
      // Gruppiere nach Artikel für Historie
      filteredData.forEach(item => {
        if (!historieMap.has(item.Artikel)) {
          historieMap.set(item.Artikel, new Map());
        }
        historieMap.get(item.Artikel).set(item.Jahr, item.abcKlasse);
      });

      // Erstelle ABC-Historie Daten - sortiert nach Artikel
      Array.from(historieMap.keys()).sort().forEach(artikel => {
        const jahreMap = historieMap.get(artikel);
        const historieItem: any = { 'Artikel': artikel };
        
        // Für jedes Jahr eine Spalte
        alleJahre.forEach(jahr => {
          historieItem[jahr.toString()] = jahreMap.get(jahr) || '';
        });
        
        abcHistorie.push(historieItem);
      });

      // Erstelle Workbook mit zwei Sheets
      const wb = XLSX.utils.book_new();
      
      // Sheet 1: Hauptdaten (nach Artikel gruppiert)
      const ws1 = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws1, 'Lageranalyse');
      
      // Sheet 2: ABC-Historie
      const ws2 = XLSX.utils.json_to_sheet(abcHistorie);
      XLSX.utils.book_append_sheet(wb, ws2, 'ABC-Historie');

      // Generiere Dateinamen mit Zeitstempel
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const fileName = `Lageranalyse_${timestamp}.xlsx`;

      // Download starten
      XLSX.writeFile(wb, fileName);
      
      console.log(`Export erfolgreich: ${exportData.length} Datensätze in 2 Sheets nach ${fileName} exportiert`);
    } catch (error) {
      console.error('Export-Fehler:', error);
      alert('Fehler beim Exportieren der Daten. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Nach Artikel suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select 
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-10 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="all">Alle Jahre</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 font-bold transition-all shadow-lg shadow-indigo-200"
          >
            <Download size={18} />
            Exportieren
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Artikel</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Jahr</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Istbestand</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Inventurergebnis</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Preis</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">ABC</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Bestandswert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((item, idx) => (
                <tr key={`${item.Artikel}-${item.Jahr}-${idx}`} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-800">{item.Artikel}</div>
                    <div className="text-[10px] text-indigo-500 font-bold tracking-tighter uppercase">---</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold bg-slate-100 text-slate-600`}>
                      {item.Jahr}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    {item.Istbestand === 0 ? '-' : item.Istbestand.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    {item.Inventurergebnis === 0 ? '-' : item.Inventurergebnis.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right font-medium text-slate-600">
                    {item.Preis === 0 ? '-' : `€${item.Preis.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-sm ${
                      item.abcKlasse === 'A' ? 'bg-indigo-600 text-white' :
                      item.abcKlasse === 'B' ? 'bg-indigo-400 text-white' :
                      'bg-indigo-200 text-indigo-900'
                    }`}>
                      {item.abcKlasse}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-slate-800">
                    {item.bestandswert === 0 ? '-' : `€${item.bestandswert.toLocaleString()}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredData.length === 0 && (
          <div className="p-20 text-center">
            <p className="text-slate-400">Keine Datensätze gefunden.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTable;
