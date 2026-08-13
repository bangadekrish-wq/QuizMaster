import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ArrowLeft, Save } from 'lucide-react';

export const EditQuizPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const q = await quizService.getQuizById(id);
        reset(q);
      } catch (err) {
        addToast('Failed to load quiz details.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id, reset]);

  const onSubmit = async (data) => {
    try {
      await quizService.updateQuiz(id, data);
      addToast('Quiz updated successfully!', 'success');
      navigate('/admin/quizzes');
    } catch (err) {
      addToast('Failed to update quiz.', 'error');
    }
  };

  if (loading) return <LoadingSpinner label="Loading quiz settings..." />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Header
        title="Edit Quiz Configuration"
        subtitle="Update metadata, scoring parameters, or publishing status."
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/quizzes')}>
            Back to Quizzes
          </Button>
        }
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Quiz Title"
            {...register('title', { required: 'Quiz title is required' })}
            error={errors.title?.message}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Description
            </label>
            <textarea
              rows={3}
              className="w-full bg-dark-bg border border-dark-border text-slate-100 rounded-ms p-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors"
              {...register('description', { required: 'Description is required' })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Category"
              options={[
                { label: 'JavaScript', value: 'JavaScript' },
                { label: 'React', value: 'React' },
                { label: 'Python', value: 'Python' },
                { label: 'HTML/CSS', value: 'HTML/CSS' },
                { label: 'Node.js & Backend', value: 'Node.js & Backend' },
                { label: 'Databases & SQL', value: 'Databases & SQL' },
              ]}
              {...register('category')}
            />

            <Select
              label="Difficulty Level"
              options={[
                { label: 'Easy', value: 'Easy' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Hard', value: 'Hard' },
              ]}
              {...register('difficulty')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Input label="Duration (Mins)" type="number" {...register('duration')} />
            <Input label="Passing Percentage (%)" type="number" {...register('passingPercentage')} />
            <Input label="Max Attempts" type="number" {...register('maxAttempts')} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Select
              label="Status"
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Published', value: 'Published' },
                { label: 'Unpublished', value: 'Unpublished' },
              ]}
              {...register('status')}
            />
            <Input label="Thumbnail Image URL" {...register('thumbnail')} />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-dark-border">
            <Button variant="ghost" onClick={() => navigate('/admin/quizzes')} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Save}>
              Update Quiz
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
