import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AttemptsChart = ({ data = [] }) => {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#212d42" vertical={false} />
        <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
        <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{
            backgroundColor: '#162032',
            borderColor: '#2e3e5c',
            borderRadius: '8px',
            color: '#f8fafc',
            fontSize: '12px',
          }}
        />
        <Area type="monotone" dataKey="attempts" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#attemptsGrad)" name="Total Attempts" />
        <Area type="monotone" dataKey="pass" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#passGrad)" name="Passed" />
      </AreaChart>
    </ResponsiveContainer>
  );
};
