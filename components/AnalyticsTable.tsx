import React, { useState, useMemo } from 'react';
import { CalculatedKPIs } from '../types';
import { Download, Search, Filter, Eye } from 'lucide-react';
import * as XLSX from 'xlsx';

interface AnalyticsTableProps {
  data: CalculatedKPIs[];
}

const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ data }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [abcFilter, setAbcFilter] = useState<'ALL' | 'A' | 'B' | 'C'>('ALL');
  const [sortConfig, setSortConfig] = useState<{
    key: keyof CalculatedKPIs;
    direction: 'asc' | 'desc';
  } | null>(null);

  const filteredData = useMemo(() => {
    let filtered = data.filter(item =>
      item.Artikel.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (abcFilter !== 'ALL') {
      filtered = filtered.filter(item => item.abcKlasse === abcFilter);
    }

    if (sortConfig) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, abcFilter, sortConfig]);

  const handleSort = (key: keyof CalculatedKPIs) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const exportToExcel = () => {
    const exportData = filteredData.map(item => ({
      'Artikel': item.Artikel,
      'Jahr': item.Jahr || '',
      'Istbestand': item.Istbestand,
      'Inventurergebnis': item.Inventurergebnis,
      'Verbrauch': item.Verbrauch,
      'Preis': item.Preis,
      'Bestandswert (€)': item.bestandswert,
      'Umschlagshäufigkeit': item.umschlagshaeufigkeit,
      'Ø Lagerdauer (Tage)': item.avgLagerdauer,
      'Kapitalbindungskosten': item.kapitalbindungskosten,
      'ABC-Klasse': item.abcKlasse,
      'Lagerstatus': item.lagerStatus
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Lageranalyse');
    XLSX.writeFile(wb, `Lageranalyse_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800">Detailanalyse</h2>
          
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Artikel suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={abcFilter}
                onChange={(e) => setAbcFilter(e.target.value as 'ALL' | 'A' | 'B' | 'C')}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="ALL">Alle Klassen</option>
                <option value="A">Nur A-Artikel</option>
                <option value="B">Nur B-Artikel</option>
                <option value="C">Nur C-Artikel</option>
              </select>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Excel Export
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Artikel
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Jahr
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Istbestand
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Verbrauch
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Bestandswert
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Ø Lagerdauer
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                ABC-Klasse
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Lagerstatus
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase tracking-widest">
                Aktionen
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-900">
                  {item.Artikel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item.Jahr}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item.Istbestand.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item.Verbrauch.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                  {item.bestandswert.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                  {item.avgLagerdauer.toFixed(0)} Tage
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.abcKlasse === 'A' ? 'bg-red-100 text-red-800' :
                    item.abcKlasse === 'B' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.abcKlasse}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-2 ${
                    item.lagerStatusColor === 'red' ? 'bg-red-100 text-red-800' :
                    item.lagerStatusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      item.lagerStatusColor === 'red' ? 'bg-red-500' :
                      item.lagerStatusColor === 'yellow' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    {item.lagerStatus}
                  </span>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Zeige {filteredData.length} von {data.length} Artikeln
        </p>
      </div>
    </div>
  );
};

export default AnalyticsTable;
