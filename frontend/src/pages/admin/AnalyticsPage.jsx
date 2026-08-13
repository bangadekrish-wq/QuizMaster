import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Header } from '../../components/layout/Header';
import { ChartCard } from '../../components/charts/ChartCard';
import { AttemptsChart } from '../../components/charts/AttemptsChart';
import { PassFailPieChart } from '../../components/charts/PassFailPieChart';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await analyticsService.getAnalyticsData(dateRange);
      setData(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  if (loading) return <LoadingSpinner label="Compiling analytics telemetry..." size="lg" />;
  if (error || !data) return <ErrorState onRetry={fetchAnalytics} />;

  const { attemptsOverTime, registrationsOverTime, passFailRatio, topQuizzes, popularCategories } = data;

  return (
    <div className="space-y-8">
      <Header
        title="Platform Analytics & Reports"
        subtitle="In-depth assessment performance telemetry and user growth metrics."
        action={
          <Select
            options={[
              { label: 'Last 7 Days', value: '7d' },
              { label: 'Last 30 Days', value: '30d' },
              { label: 'Last 3 Months', value: '90d' },
              { label: 'Last Year', value: '1y' },
            ]}
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-40"
          />
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Quiz Attempts Over Time" subtitle="Volume of submissions and outcomes">
          <AttemptsChart data={attemptsOverTime} />
        </ChartCard>

        <ChartCard title="Student Registrations Trend" subtitle="New platform user acquisition">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={registrationsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#212d42" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ backgroundColor: '#162032', borderColor: '#2e3e5c', borderRadius: '8px' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="New Users" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Pass / Fail Ratio" subtitle="Distribution of student scoring thresholds">
          <PassFailPieChart data={passFailRatio} />
        </ChartCard>

        <ChartCard title="Most Attempted Quizzes" subtitle="Highest engagement assessment modules">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topQuizzes} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#212d42" horizontal={false} />
              <XAxis type="number" stroke="#64748b" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={120} />
              <Tooltip contentStyle={{ backgroundColor: '#162032', borderColor: '#2e3e5c', borderRadius: '8px' }} />
              <Bar dataKey="attempts" fill="#06b6d4" radius={[0, 6, 6, 0]} name="Attempts" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
