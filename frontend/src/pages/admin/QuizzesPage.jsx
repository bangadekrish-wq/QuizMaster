import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { Table } from '../../components/common/Table';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Plus, Edit2, HelpCircle, Trash2, Globe, EyeOff, Award } from 'lucide-react';
import { formatDuration } from '../../utils/formatters';

export const QuizzesPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await quizService.getQuizzes({ search, status: statusFilter });
      setQuizzes(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, [search, statusFilter]);

  const handleTogglePublish = async (quiz) => {
    const nextStatus = quiz.status === 'Published' ? 'Unpublished' : 'Published';
    try {
      await quizService.publishQuiz(quiz.id, nextStatus);
      addToast(`Quiz "${quiz.title}" is now ${nextStatus}`, 'success');
      fetchQuizzes();
    } catch (err) {
      addToast('Failed to update quiz status', 'error');
    }
  };

  const handleDeleteQuiz = async () => {
    if (!deleteTarget) return;
    try {
      await quizService.deleteQuiz(deleteTarget.id);
      addToast(`Quiz "${deleteTarget.title}" deleted.`, 'info');
      fetchQuizzes();
    } catch (err) {
      addToast('Failed to delete quiz.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      header: 'Quiz Title',
      accessor: 'title',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-ms bg-dark-sidebar border border-dark-border overflow-hidden flex-shrink-0">
            {row.thumbnail ? (
              <img src={row.thumbnail} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-brand-cyan">
                <Award className="w-5 h-5" />
              </div>
            )}
          </div>
          <div>
            <span className="font-bold text-slate-100 line-clamp-1">{row.title}</span>
            <span className="text-[11px] text-slate-400 block">{row.category}</span>
          </div>
        </div>
      ),
    },
    { header: 'Category', accessor: 'category' },
    {
      header: 'Difficulty',
      accessor: 'difficulty',
      render: (r) => (
        <Badge variant={r.difficulty === 'Easy' ? 'green' : r.difficulty === 'Hard' ? 'red' : 'orange'}>
          {r.difficulty}
        </Badge>
      ),
    },
    { header: 'Questions', accessor: 'questionsCount' },
    {
      header: 'Duration',
      accessor: 'duration',
      render: (r) => formatDuration(r.duration),
    },
    { header: 'Attempts', accessor: 'attemptsCount' },
    {
      header: 'Status',
      accessor: 'status',
      render: (r) => (
        <Badge variant={r.status === 'Published' ? 'green' : r.status === 'Draft' ? 'orange' : 'gray'}>
          {r.status}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            icon={HelpCircle}
            onClick={() => navigate(`/admin/quizzes/${r.id}/questions`)}
            title="Manage Questions"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Edit2}
            onClick={() => navigate(`/admin/quizzes/${r.id}/edit`)}
            title="Edit Quiz"
          />
          <Button
            variant="ghost"
            size="sm"
            icon={r.status === 'Published' ? EyeOff : Globe}
            onClick={() => handleTogglePublish(r)}
            title={r.status === 'Published' ? 'Unpublish Quiz' : 'Publish Quiz'}
          />
          <Button
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="hover:text-brand-red"
            onClick={() => setDeleteTarget(r)}
            title="Delete Quiz"
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Header
        title="Quiz Management"
        subtitle="Create, configure, and publish online quizzes and assessments."
        action={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/admin/quizzes/create')}>
            Create Quiz
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="w-full sm:w-72">
          <SearchBar value={search} onChange={setSearch} placeholder="Search quizzes..." />
        </div>
        <FilterBar
          filters={['All', 'Published', 'Draft', 'Unpublished']}
          activeFilter={statusFilter}
          onSelectFilter={setStatusFilter}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading quiz catalog..." />
      ) : error ? (
        <ErrorState onRetry={fetchQuizzes} />
      ) : (
        <Table columns={columns} data={quizzes} emptyText="No quizzes found." />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteQuiz}
        title="Delete Quiz"
        message={`Are you sure you want to delete quiz "${deleteTarget?.title}"? All associated question data will be lost.`}
        variant="danger"
      />
    </div>
  );
};
