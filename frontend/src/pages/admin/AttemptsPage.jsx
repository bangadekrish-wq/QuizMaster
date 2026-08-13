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
import { formatDateTime, formatTimeSeconds } from '../../utils/formatters';

export const AttemptsPage = () => {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchAttempts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await attemptService.getAttempts({ search, status: statusFilter });
      setAttempts(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [search, statusFilter]);

  const columns = [
    {
      header: 'Student',
      accessor: 'studentName',
      render: (r) => (
        <div>
          <span className="font-bold text-slate-100 block">{r.studentName}</span>
          <span className="text-[11px] text-slate-400">{r.studentEmail}</span>
        </div>
      ),
    },
    { header: 'Quiz Title', accessor: 'quizTitle', render: (r) => <span className="font-semibold text-slate-200">{r.quizTitle}</span> },
    { header: 'Date', accessor: 'date', render: (r) => formatDateTime(r.date) },
    { header: 'Score', accessor: 'score', render: (r) => `${r.score} / ${r.totalMarks}` },
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
    {
      header: 'Time Taken',
      accessor: 'timeTaken',
      render: (r) => formatTimeSeconds(r.timeTaken),
    },
    {
      header: 'Actions',
      render: (r) => (
        <Button
          variant="ghost"
          size="sm"
          icon={Eye}
          onClick={() => navigate(`/admin/attempts/${r.id}`)}
          title="View Submission Result"
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Assessment Attempts Audit"
        subtitle="Monitor and inspect all student test submissions and scores."
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search student or quiz title..." />
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
        <ErrorState onRetry={fetchAttempts} />
      ) : (
        <Table columns={columns} data={attempts} emptyText="No attempt records found." />
      )}
    </div>
  );
};
