
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { CalculatedKPIs } from '../../../shared/types';
import { Package, TrendingUp, DollarSign, Activity } from 'lucide-react';
import Logo from '../../../shared/components/Logo';

interface DashboardProps {
  data: CalculatedKPIs[];
}

const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-sm">
          <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-400">
            <Activity size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">Keine Daten verfügbar</h3>
          <p className="text-slate-500">Laden Sie eine CSV- oder Excel-Datei hoch, um die Analyse zu starten.</p>
        </div>
      </div>
    );
  }

  const latestYear = Math.max(...data.filter(d => d.abcKlasse !== 'Prognose').map(d => d.Jahr));
  const latestData = data.filter(d => d.Jahr === latestYear);

  const stats = useMemo(() => {
    const totalValue = latestData.reduce((sum, item) => sum + item.bestandswert, 0);
    const totalConsumption = latestData.reduce((sum, item) => sum + item.verbrauchswert, 0);
    const avgUmschlag = latestData.reduce((sum, item) => sum + item.umschlagshaeufigkeit, 0) / latestData.length;
    
    return [
      { label: 'Gesamtbestandswert', value: `€${totalValue.toLocaleString()}`, icon: <Package />, color: 'bg-blue-500' },
      { label: 'Gesamtverbrauch', value: `€${totalConsumption.toLocaleString()}`, icon: <TrendingUp />, color: 'bg-green-500' },
      { label: 'Ø Umschlagshäufigkeit', value: avgUmschlag.toFixed(2), icon: <Activity />, color: 'bg-purple-500' },
      { label: 'Kapitalbindung', value: `€${latestData.reduce((s, i) => s + i.kapitalbindungskosten, 0).toLocaleString()}`, icon: <DollarSign />, color: 'bg-amber-500' },
    ];
  }, [latestData]);

  const abcChartData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    latestData.forEach(d => {
      if (d.abcKlasse !== 'Prognose') counts[d.abcKlasse]++;
    });
    return [
      { name: 'A-Güter', value: counts.A, color: '#4f46e5' },
      { name: 'B-Güter', value: counts.B, color: '#818cf8' },
      { name: 'C-Güter', value: counts.C, color: '#c7d2fe' },
    ];
  }, [latestData]);

  const top10Articles = useMemo(() => {
    return [...latestData]
      .sort((a, b) => b.verbrauchswert - a.verbrauchswert)
      .slice(0, 8);
  }, [latestData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-6">
            <div className={`${s.color} p-4 rounded-2xl text-white shadow-lg`}>
              {s.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-400">{s.label}</p>
              <p className="text-2xl font-bold text-slate-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ABC Distribution Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            ABC-Verteilung <span className="text-xs font-normal text-slate-400">({latestYear})</span>
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={abcChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {abcChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Articles Bar Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top 8 Artikel nach Verbrauchswert</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top10Articles}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="Artikel" fontSize={12} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tick={{fill: '#64748b'}} tickLine={false} axisLine={false} tickFormatter={(val) => `€${val/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="verbrauchswert" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        
      </div>
    </div>
  );
};

export default Dashboard;
