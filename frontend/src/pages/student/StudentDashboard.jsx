import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analyticsService } from '../../services/analyticsService';
import { quizService } from '../../services/quizService';
import { categoryService } from '../../services/categoryService';
import { leaderboardService } from '../../services/leaderboardService';
import { Header } from '../../components/layout/Header';
import { StatCard } from '../../components/common/StatCard';
import { HeroBanner } from '../../components/student/HeroBanner';
import { CategoryCard } from '../../components/student/CategoryCard';
import { QuizCard } from '../../components/quiz/QuizCard';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import {
  Award,
  CheckCircle2,
  XCircle,
  BarChart2,
  Trophy,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

export const StudentDashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(false);
      try {
        const statsRes = await analyticsService.getStudentStats();
        const quizRes = await quizService.getQuizzes({ status: 'Published' });
        const catRes = await categoryService.getCategories();
        const lbRes = await leaderboardService.getLeaderboard('Weekly');

        setStats(statsRes);
        setQuizzes(quizRes);
        setCategories(catRes);
        setLeaderboard(lbRes);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner label="Loading your personalized dashboard..." size="lg" />;
  if (error || !stats) return <ErrorState onRetry={() => window.location.reload()} />;

  const featuredQuiz = quizzes[0] || null;

  return (
    <div className="space-y-8">
      {/* Personalized Header */}
      <Header
        title="Welcome back, Krish! 👋"
        subtitle="Ready to test your knowledge today?"
        action={
          <Button
            variant="primary"
            icon={Sparkles}
            onClick={() => navigate('/student/quizzes')}
          >
            Explore All Quizzes
          </Button>
        }
      />

      {/* Hero Featured Assessment Banner (Microsoft Store Style) */}
      {featuredQuiz && <HeroBanner quiz={featuredQuiz} />}

      {/* Student Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Award} label="Quizzes Attempted" value={stats.quizzesAttempted} accentColor="cyan" />
        <StatCard icon={CheckCircle2} label="Quizzes Passed" value={stats.quizzesPassed} accentColor="green" />
        <StatCard icon={XCircle} label="Quizzes Failed" value={stats.quizzesFailed} isIncrease={false} accentColor="red" />
        <StatCard icon={BarChart2} label="Average Score" value={`${stats.averageScore}%`} accentColor="purple" />
        <StatCard icon={Trophy} label="Highest Score" value={`${stats.highestScore}%`} accentColor="orange" />
      </div>

      {/* Performance Overview Chart & Recent Attempts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 flex flex-col justify-between p-6">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-100">Your Performance Overview</h3>
              <p className="text-xs text-slate-400">Score progress over recent attempt sessions</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.performanceHistory || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#162032', borderColor: '#2e3e5c', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="score" stroke="#06b6d4" strokeWidth={3} fill="url(#scoreGrad)" name="Score %" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Attempts Widget */}
        <Card className="p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <h3 className="text-base font-bold text-slate-100">Recent Attempts</h3>
            <button
              onClick={() => navigate('/student/attempts')}
              className="text-xs font-bold text-brand-cyan hover:underline"
            >
              View All
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentAttempts?.map((att) => (
              <div
                key={att.id}
                onClick={() => navigate(`/student/attempts/${att.id}/result`)}
                className="flex items-center justify-between p-3 rounded-ms bg-dark-bg/50 border border-dark-border/60 hover:bg-dark-cardHover transition-colors cursor-pointer"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{att.quizTitle}</h4>
                  <span className="text-[10px] text-slate-400">{att.date}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-brand-cyanLight">{att.score}%</span>
                  <Badge variant={att.status === 'Passed' ? 'green' : 'red'} size="sm" className="block mt-0.5">
                    {att.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Categories Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-100">Top Categories</h3>
          <button
            onClick={() => navigate('/student/quizzes')}
            className="text-xs font-bold text-brand-cyan hover:underline flex items-center gap-1"
          >
            Explore Categories <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={() => navigate(`/student/quizzes?category=${encodeURIComponent(cat.name)}`)}
            />
          ))}
        </div>
      </div>

      {/* Recommended Quizzes Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-100">Recommended Quizzes for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.slice(0, 3).map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} role="STUDENT" />
          ))}
        </div>
      </div>

      {/* Mini Leaderboard Standings Widget */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-brand-orange" /> Leaderboard Standings
          </h3>
          <button
            onClick={() => navigate('/student/leaderboard')}
            className="text-xs font-bold text-brand-cyan hover:underline"
          >
            Full Leaderboard →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {leaderboard.slice(0, 3).map((item) => (
            <div
              key={item.rank}
              className={`flex items-center gap-3 p-3.5 rounded-ms border ${
                item.isCurrentUser
                  ? 'bg-brand-cyan/15 border-brand-cyan text-white shadow-ms-glow'
                  : 'bg-dark-bg/60 border-dark-border text-slate-200'
              }`}
            >
              <span className="w-7 h-7 rounded-full bg-dark-elevated text-xs font-bold flex items-center justify-center text-brand-cyan">
                #{item.rank}
              </span>
              <Avatar src={item.avatar} name={item.name} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400">{item.quizzesCompleted} Quizzes</p>
              </div>
              <span className="text-xs font-extrabold text-brand-greenLight">{item.averageScore}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
