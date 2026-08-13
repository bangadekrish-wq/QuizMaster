import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { categoryService } from '../../services/categoryService';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { FilterBar } from '../../components/common/FilterBar';
import { QuizCard } from '../../components/quiz/QuizCard';
import { Select } from '../../components/common/Select';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LayoutGrid, List } from 'lucide-react';

export const QuizDiscoveryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';

  const [quizzes, setQuizzes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const catRes = await categoryService.getCategories();
      setCategories(catRes);

      const quizRes = await quizService.getQuizzes({
        search,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        status: 'Published',
      });
      setQuizzes(quizRes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, selectedCategory, selectedDifficulty]);

  const categoryFilterItems = ['All', ...categories.map((c) => c.name)];

  return (
    <div className="space-y-6">
      <Header
        title="Explore & Discover Assessments"
        subtitle="Test your software engineering, language, and computer science skills."
      />

      {/* Control Filters Bar */}
      <div className="flex flex-col gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-80">
            <SearchBar value={search} onChange={setSearch} placeholder="Search quizzes by title or keywords..." />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              options={[
                { label: 'All Difficulties', value: 'All' },
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
              ]}
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="w-40"
            />

            {/* View Mode Toggle */}
            <div className="flex items-center bg-dark-bg p-1 rounded-ms border border-dark-border">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-ms transition-colors ${
                  viewMode === 'grid' ? 'bg-brand-cyan text-dark-bg font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-ms transition-colors ${
                  viewMode === 'list' ? 'bg-brand-cyan text-dark-bg font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <FilterBar
          filters={categoryFilterItems}
          activeFilter={selectedCategory}
          onSelectFilter={setSelectedCategory}
        />
      </div>

      {/* Main Quizzes Display */}
      {loading ? (
        <LoadingSpinner label="Loading quiz catalog..." size="lg" />
      ) : error ? (
        <ErrorState onRetry={fetchData} />
      ) : quizzes.length === 0 ? (
        <EmptyState
          title="No Quizzes Found"
          description="We couldn't find any published quizzes matching your search parameters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearch('');
            setSelectedCategory('All');
            setSelectedDifficulty('All');
          }}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }
        >
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} role="STUDENT" />
          ))}
        </div>
      )}
    </div>
  );
};
