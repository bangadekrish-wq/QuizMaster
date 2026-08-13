import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { attemptService } from '../../services/attemptService';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Eye } from 'lucide-react';
import { formatDate, formatTimeSeconds } from '../../utils/formatters';

export const AttemptHistoryPage = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchHistory = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await attemptService.getAttempts({ search, status: statusFilter });
      const attemptList = Array.isArray(res) ? res : res?.data || res?.attempts || [];
      setAttempts(attemptList);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [search, statusFilter]);

  const columns = [
    {
      header: 'Quiz Title',
      accessor: 'quizTitle',
      render: (r) => <span className="font-bold text-slate-100">{r.quizTitle}</span>,
    },
    { header: 'Date', accessor: 'date', render: (r) => formatDate(r.date) },
    { header: 'Score', accessor: 'score', render: (r) => `${r.score} / ${r.totalMarks || 25}` },
    {
      header: 'Percentage',
      accessor: 'percentage',
      render: (r) => <span className="font-bold text-brand-cyanLight">{r.percentage}%</span>,
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => <Badge variant={r.status === 'Passed' ? 'green' : 'red'}>{r.status}</Badge>,
    },
    { header: 'Time Taken', accessor: 'timeTaken', render: (r) => formatTimeSeconds(r.timeTaken) },
    {
      header: 'Actions',
      render: (r) => (
        <Button
          variant="outline"
          size="sm"
          icon={Eye}
          onClick={() => navigate(`/student/attempts/${r.id}/result`)}
        >
          View Result
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header title="My Attempt History" subtitle="Review your past test submissions and improvement trends." />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search quiz title..." />
        </div>
        <FilterBar
          filters={['All', 'Passed', 'Failed']}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching attempt logs..." />
      ) : error ? (
        <ErrorState onRetry={fetchHistory} />
      ) : (
        <Table columns={columns} data={attempts} emptyText="No attempt history recorded yet." />
      )}
    </div>
  );
};
