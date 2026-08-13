import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Avatar } from '../../components/common/Avatar';
import { Badge } from '../../components/common/Badge';
import { Table } from '../../components/common/Table';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { ArrowLeft, Award, CheckCircle2, TrendingUp, Calendar, Mail } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const res = await userService.getUserById(id);
        setUser(res);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  if (loading) return <LoadingSpinner label="Loading user details..." />;
  if (error || !user) return <ErrorState onRetry={() => window.location.reload()} />;

  const historyColumns = [
    { header: 'Quiz Title', accessor: 'quizTitle', render: (r) => <span className="font-bold text-slate-100">{r.quizTitle}</span> },
    { header: 'Date', accessor: 'date', render: (r) => formatDate(r.date) },
    { header: 'Score', accessor: 'score', render: (r) => <span className="font-bold text-brand-cyanLight">{r.score}</span> },
    { header: 'Percentage', accessor: 'percentage', render: (r) => `${r.percentage}%` },
    { header: 'Status', accessor: 'status', render: (r) => <Badge variant={r.status === 'Passed' ? 'green' : 'red'}>{r.status}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Student Profile Details"
        subtitle={`Detailed metrics and attempt history for ${user.name}`}
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/users')}>
            Back to Users
          </Button>
        }
      />

      {/* User Header Profile Card */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6">
        <div className="flex items-center gap-5">
          <Avatar src={user.avatar} name={user.name} size="xl" />
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
              <Badge variant={user.status === 'Active' ? 'green' : 'red'}>{user.status}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-brand-cyan" /> {user.email}</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-purple" /> Member since {formatDate(user.registrationDate)}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-ms bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Quizzes Attempted</span>
            <div className="text-2xl font-bold text-slate-100">{user.quizzesAttempted}</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-ms bg-brand-purple/15 text-brand-purpleLight border border-brand-purple/30">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Average Score</span>
            <div className="text-2xl font-bold text-brand-cyanLight">{user.averageScore}%</div>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-5">
          <div className="p-3 rounded-ms bg-brand-green/15 text-brand-greenLight border border-brand-green/30">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Highest Score</span>
            <div className="text-2xl font-bold text-brand-greenLight">{user.highestScore}%</div>
          </div>
        </Card>
      </div>

      {/* Attempt History Table */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-100">Recent Quiz Attempt History</h3>
        <Table columns={historyColumns} data={user.history || []} emptyText="No attempts logged yet." />
      </div>
    </div>
  );
};
