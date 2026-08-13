import React, { useEffect, useState } from 'react';
import { leaderboardService } from '../../services/leaderboardService';
import { Header } from '../../components/layout/Header';
import { FilterBar } from '../../components/common/FilterBar';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Trophy, Medal, Award } from 'lucide-react';

export const AdminLeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [activeTab, setActiveTab] = useState('Overall');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await leaderboardService.getLeaderboard(activeTab);
      setLeaderboard(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [activeTab]);

  const topThree = leaderboard.slice(0, 3);
  const restList = leaderboard.slice(3);

  const columns = [
    {
      header: 'Rank',
      accessor: 'rank',
      render: (r) => <span className="font-extrabold text-brand-cyan">#{r.rank}</span>,
    },
    {
      header: 'Student',
      accessor: 'name',
      render: (r) => (
        <div className="flex items-center gap-3">
          <Avatar src={r.avatar} name={r.name} size="sm" />
          <span className="font-bold text-slate-100">{r.name}</span>
        </div>
      ),
    },
    {
      header: 'Average Score',
      accessor: 'averageScore',
      render: (r) => <span className="font-bold text-brand-greenLight">{r.averageScore}%</span>,
    },
    { header: 'Quizzes Completed', accessor: 'quizzesCompleted' },
    {
      header: 'Total Points',
      accessor: 'points',
      render: (r) => <Badge variant="purple">{r.points} pts</Badge>,
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Header
        title="Global Platform Leaderboard"
        subtitle="Rankings based on assessment scores, consistency, and completed quizzes."
      />

      <div className="flex justify-center border-b border-dark-border pb-4">
        <FilterBar
          filters={['Overall', 'Weekly', 'Monthly']}
          activeFilter={activeTab}
          onSelectFilter={setActiveTab}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching leaderboard standouts..." />
      ) : error ? (
        <ErrorState onRetry={fetchLeaderboard} />
      ) : (
        <>
          {/* Top 3 Podium Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            {topThree[1] && (
              <Card className="flex flex-col items-center text-center p-6 border-slate-400/30 bg-gradient-to-b from-dark-card to-dark-bg order-2 md:order-1">
                <Medal className="w-8 h-8 text-slate-300 mb-2" />
                <Avatar src={topThree[1].avatar} name={topThree[1].name} size="lg" className="ring-2 ring-slate-400" />
                <span className="mt-3 font-bold text-slate-100">{topThree[1].name}</span>
                <Badge variant="gray" className="mt-1">Rank #2</Badge>
                <div className="text-xl font-extrabold text-brand-cyanLight mt-3">{topThree[1].averageScore}%</div>
                <span className="text-xs text-slate-400">{topThree[1].quizzesCompleted} Quizzes</span>
              </Card>
            )}

            {topThree[0] && (
              <Card className="flex flex-col items-center text-center p-6 border-brand-orange/40 bg-gradient-to-b from-brand-orange/10 to-dark-card shadow-ms-glow order-1 md:order-2 scale-105">
                <Trophy className="w-10 h-10 text-brand-orange mb-2 animate-bounce" />
                <Avatar src={topThree[0].avatar} name={topThree[0].name} size="xl" className="ring-4 ring-brand-orange" />
                <span className="mt-3 text-lg font-bold text-slate-100">{topThree[0].name}</span>
                <Badge variant="orange" className="mt-1">🏆 CHAMPION #1</Badge>
                <div className="text-2xl font-extrabold text-brand-orangeLight mt-3">{topThree[0].averageScore}%</div>
                <span className="text-xs text-slate-400">{topThree[0].quizzesCompleted} Quizzes</span>
              </Card>
            )}

            {topThree[2] && (
              <Card className="flex flex-col items-center text-center p-6 border-amber-700/40 bg-gradient-to-b from-dark-card to-dark-bg order-3">
                <Award className="w-8 h-8 text-amber-600 mb-2" />
                <Avatar src={topThree[2].avatar} name={topThree[2].name} size="lg" className="ring-2 ring-amber-600" />
                <span className="mt-3 font-bold text-slate-100">{topThree[2].name}</span>
                <Badge variant="orange" className="mt-1">Rank #3</Badge>
                <div className="text-xl font-extrabold text-brand-cyanLight mt-3">{topThree[2].averageScore}%</div>
                <span className="text-xs text-slate-400">{topThree[2].quizzesCompleted} Quizzes</span>
              </Card>
            )}
          </div>

          <Table columns={columns} data={leaderboard} emptyText="No leaderboard data available." />
        </>
      )}
    </div>
  );
};
