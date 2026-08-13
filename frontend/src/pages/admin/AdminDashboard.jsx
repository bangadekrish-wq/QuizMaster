import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/common/StatCard';
import { ChartCard } from '../../components/charts/ChartCard';
import { AttemptsChart } from '../../components/charts/AttemptsChart';
import { PassFailPieChart } from '../../components/charts/PassFailPieChart';
import { ActivityItem } from '../../components/admin/ActivityItem';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Card } from '../../components/common/Card';
import { Select } from '../../components/common/Select';
import {
  Users,
  BookOpen,
  CheckCircle2,
  FileEdit,
  HelpCircle,
  Award,
  BarChart2,
  Check,
  XCircle,
  Percent,
  Trophy,
  Folder,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState('30d');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await analyticsService.getAdminDashboardData(dateRange);
      setData(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  if (loading) return <LoadingSpinner label="Loading dashboard metrics..." size="lg" />;
  if (error || !data) return <ErrorState onRetry={fetchDashboardData} />;

  const { stats, attemptsTimeSeries, passFailRatio, topQuizzes, popularCategories, recentActivities } = data;

  return (
    <div className="space-y-8">
      {/* Dashboard Header */}
      <Header
        title="Welcome back, Krish! 👋"
        subtitle="Here's what's happening with your platform today."
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

      {/* Row 1 Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          icon={Users}
          label="Total Students"
          value={stats.totalStudents}
          change={stats.changes?.students}
          accentColor="cyan"
        />
        <StatCard
          icon={BookOpen}
          label="Total Quizzes"
          value={stats.totalQuizzes}
          change={stats.changes?.quizzes}
          accentColor="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Published Quizzes"
          value={stats.publishedQuizzes}
          change={stats.changes?.published}
          accentColor="green"
        />
        <StatCard
          icon={FileEdit}
          label="Draft Quizzes"
          value={stats.draftQuizzes}
          change={stats.changes?.draft}
          isIncrease={false}
          accentColor="orange"
        />
        <StatCard
          icon={HelpCircle}
          label="Total Questions"
          value={stats.totalQuestions}
          change={stats.changes?.questions}
          accentColor="purple"
        />
        <StatCard
          icon={Award}
          label="Total Attempts"
          value={stats.totalAttempts}
          change={stats.changes?.attempts}
          accentColor="red"
        />
      </div>

      {/* Row 2 Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BarChart2}
          label="Average Score"
          value={`${stats.averageScore}%`}
          change={stats.changes?.averageScore}
          accentColor="purple"
        />
        <StatCard
          icon={Check}
          label="Passed Attempts"
          value={stats.passedAttempts}
          change={stats.changes?.passed}
          accentColor="green"
        />
        <StatCard
          icon={XCircle}
          label="Failed Attempts"
          value={stats.failedAttempts}
          change={stats.changes?.failed}
          isIncrease={false}
          accentColor="red"
        />
        <StatCard
          icon={Percent}
          label="Pass Rate"
          value={`${stats.passRate}%`}
          change={stats.changes?.passRate}
          accentColor="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard
          title="Quiz Attempts Over Time"
          subtitle="Daily attempt trends and pass/fail distribution"
          className="lg:col-span-2"
        >
          <AttemptsChart data={attemptsTimeSeries} />
        </ChartCard>

        <ChartCard title="Pass / Fail Ratio" subtitle="Overall student outcome distribution">
          <PassFailPieChart data={passFailRatio} />
        </ChartCard>
      </div>

      {/* Bottom Sections: Top Performing Quizzes, Popular Categories, Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Performing Quizzes */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand-orange" /> Top Performing Quizzes
            </h3>
          </div>
          <div className="space-y-3">
            {topQuizzes.map((quiz) => (
              <div
                key={quiz.rank}
                className="flex items-center justify-between p-3 rounded-ms bg-dark-bg/40 border border-dark-border/60 hover:bg-dark-cardHover transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-dark-elevated text-xs font-bold flex items-center justify-center border border-dark-border text-brand-cyan">
                    #{quiz.rank}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{quiz.name}</h4>
                    <span className="text-[11px] text-slate-400">{quiz.attempts} Attempts</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-greenLight">{quiz.avgScore}%</span>
                  <span className="text-[10px] text-slate-500 block">Avg Score</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Most Popular Categories */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Folder className="w-5 h-5 text-brand-cyan" /> Popular Categories
            </h3>
          </div>
          <div className="space-y-3.5">
            {popularCategories.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">{cat.name}</span>
                  <span className="text-slate-400 font-medium">
                    {cat.attemptCount} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-dark-bg overflow-hidden border border-dark-border">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-slate-100">Recent Activities</h3>
          </div>
          <div className="space-y-3">
            {recentActivities.map((act) => (
              <ActivityItem key={act.id} activity={act} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
