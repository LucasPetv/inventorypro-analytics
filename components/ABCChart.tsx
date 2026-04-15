import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { CalculatedKPIs } from '../types';

interface ABCChartProps {
  data: CalculatedKPIs[];
}

const ABCChart: React.FC<ABCChartProps> = ({ data }) => {
  const abcData = [
    {
      name: 'A-Artikel',
      value: data.filter(item => item.abcKlasse === 'A').length,
      color: '#ef4444'
    },
    {
      name: 'B-Artikel', 
      value: data.filter(item => item.abcKlasse === 'B').length,
      color: '#f59e0b'
    },
    {
      name: 'C-Artikel',
      value: data.filter(item => item.abcKlasse === 'C').length,
      color: '#10b981'
    }
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#10b981'];

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={abcData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {abcData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ABCChart;