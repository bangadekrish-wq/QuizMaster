import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { QuestionEditorModal } from '../../components/admin/QuestionEditorModal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Plus, Edit2, Trash2, ArrowLeft, CheckCircle2, HelpCircle, FileSpreadsheet, Download } from 'lucide-react';

export const QuestionsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Question Editor Modal State
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [excelImporting, setExcelImporting] = useState(false);

  const fetchQuestionsData = async () => {
    setLoading(true);
    setError(false);
    try {
      const quizRes = await quizService.getQuizById(id);
      const questionsRes = await questionService.getQuestionsByQuizId(id);
      setQuiz(quizRes);
      setQuestions(questionsRes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestionsData();
  }, [id]);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      addToast('Please upload a valid Excel spreadsheet (.xlsx, .xls, or .csv)', 'error');
      return;
    }

    setExcelImporting(true);
    try {
      const res = await quizService.importExcel(id, file);
      addToast(res.message || 'Successfully imported random 20 questions from Excel!', 'success');
      fetchQuestionsData();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to import Excel spreadsheet.', 'error');
    } finally {
      setExcelImporting(false);
      e.target.value = null;
    }
  };

  const handleSaveQuestion = async (formData) => {
    setSubmitting(true);
    try {
      if (editingQuestion) {
        await questionService.updateQuestion(editingQuestion.id, formData);
        addToast('Question updated!', 'success');
      } else {
        await questionService.createQuestion(id, formData);
        addToast('New question added to quiz!', 'success');
      }
      setEditorOpen(false);
      fetchQuestionsData();
    } catch (err) {
      addToast('Failed to save question.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deleteTarget) return;
    try {
      await questionService.deleteQuestion(deleteTarget.id);
      addToast('Question deleted.', 'info');
      fetchQuestionsData();
    } catch (err) {
      addToast('Failed to delete question.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  if (loading) return <LoadingSpinner label="Loading quiz questions..." />;
  if (error || !quiz) return <ErrorState onRetry={fetchQuestionsData} />;

  return (
    <div className="space-y-6">
      <Header
        title={`Questions: ${quiz.title}`}
        subtitle={`Manage question bank and options for ${quiz.category} assessment (${questions.length} questions).`}
        action={
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/quizzes')}>
              Back
            </Button>
            <Button
              variant="ghost"
              icon={Download}
              onClick={() => quizService.downloadExcelTemplate()}
              title="Download Excel Template"
            >
              Template
            </Button>
            <label className="inline-flex">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
                disabled={excelImporting}
              />
              <Button
                as="span"
                variant="purple"
                icon={FileSpreadsheet}
                isLoading={excelImporting}
                className="cursor-pointer"
              >
                Import Excel (Random 20)
              </Button>
            </label>
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => {
                setEditingQuestion(null);
                setEditorOpen(true);
              }}
            >
              Add Question
            </Button>
          </div>
        }
      />

      {questions.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <HelpCircle className="w-12 h-12 text-brand-cyan mb-3" />
          <h3 className="text-base font-bold text-slate-100">No Questions Added Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4">
            Upload an Excel sheet to pick 20 random questions automatically, or add questions manually.
          </p>
          <div className="flex items-center gap-3">
            <label className="inline-flex">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleExcelUpload}
                disabled={excelImporting}
              />
              <Button variant="purple" icon={FileSpreadsheet} isLoading={excelImporting} className="cursor-pointer">
                Upload Excel Sheet (.xlsx)
              </Button>
            </label>
            <Button variant="primary" icon={Plus} onClick={() => setEditorOpen(true)}>
              Add Question Manually
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((q, idx) => (
            <Card key={q.id || idx} className="p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-ms bg-brand-cyan/15 text-brand-cyan font-bold text-xs flex items-center justify-center border border-brand-cyan/30">
                    Q{idx + 1}
                  </span>
                  <Badge variant="purple">{q.type || 'Multiple Choice'}</Badge>
                  <Badge variant={q.difficulty === 'Easy' ? 'green' : q.difficulty === 'Hard' ? 'red' : 'orange'}>
                    {q.difficulty}
                  </Badge>
                  <span className="text-xs text-slate-400 font-semibold">{q.marks} Marks</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Edit2}
                    onClick={() => {
                      setEditingQuestion(q);
                      setEditorOpen(true);
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={Trash2}
                    className="hover:text-brand-red"
                    onClick={() => setDeleteTarget(q)}
                  />
                </div>
              </div>

              {/* Question Text */}
              <h4 className="text-base font-semibold text-slate-100 mb-4">{q.text}</h4>

              {/* Options Preview */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {q.options?.map((opt, optIdx) => {
                  const isCorrect = typeof opt === 'object' ? opt.isCorrect : optIdx === 0;
                  const text = typeof opt === 'object' ? opt.text : opt;

                  return (
                    <div
                      key={optIdx}
                      className={`flex items-center justify-between p-3 rounded-ms text-xs border ${
                        isCorrect
                          ? 'bg-brand-green/15 border-brand-green/40 text-brand-greenLight font-bold'
                          : 'bg-dark-bg/60 border-dark-border text-slate-300'
                      }`}
                    >
                      <span>{text}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-brand-green flex-shrink-0" />}
                    </div>
                  );
                })}
              </div>

              {q.explanation && (
                <div className="mt-4 pt-3 border-t border-dark-border/60 text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Question Form Modal */}
      <QuestionEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSubmit={handleSaveQuestion}
        initialData={editingQuestion}
        isLoading={submitting}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteQuestion}
        title="Delete Question"
        message="Are you sure you want to delete this question?"
        variant="danger"
      />
    </div>
  );
};
