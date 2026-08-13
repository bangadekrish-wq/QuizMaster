import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

export const PassFailPieChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={85}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || (index === 0 ? '#10b981' : '#ef4444')} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#162032',
            borderColor: '#2e3e5c',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '12px',
          }}
        />
        <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
