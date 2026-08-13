import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { quizService } from '../../services/quizService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Select } from '../../components/common/Select';
import { Button } from '../../components/common/Button';
import {
  ArrowLeft,
  Save,
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  X,
  ListOrdered,
  ChevronLeft,
  ChevronRight,
  Plus,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export const CreateQuizPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [excelFile, setExcelFile] = useState(null);

  // Dynamic Question Slots State
  const [questionCount, setQuestionCount] = useState(20);
  const [questionSlots, setQuestionSlots] = useState([]);
  const [activeSlotIdx, setActiveSlotIdx] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: 'JavaScript',
      difficulty: 'Medium',
      duration: 20,
      passingPercentage: 75,
      maxAttempts: 3,
      status: 'Draft',
      thumbnail: '',
    },
  });

  // Generate N question slots (e.g., 20 slots)
  const generateSlots = (count) => {
    const num = Math.max(1, Math.min(100, parseInt(count) || 20));
    const newSlots = Array.from({ length: num }, (_, idx) => ({
      slotId: idx + 1,
      questionText: '',
      marks: 1,
      explanation: '',
      correctOptionIdx: 0,
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    }));
    setQuestionSlots(newSlots);
    setActiveSlotIdx(0);
    addToast(`Generated ${num} question slots! You can now write questions & answers below.`, 'success');
  };

  const handleSlotFieldChange = (field, val) => {
    setQuestionSlots((prev) => {
      const updated = [...prev];
      updated[activeSlotIdx] = {
        ...updated[activeSlotIdx],
        [field]: val,
      };
      return updated;
    });
  };

  const handleOptionTextChange = (optIdx, text) => {
    setQuestionSlots((prev) => {
      const updated = [...prev];
      const currentOpts = [...updated[activeSlotIdx].options];
      currentOpts[optIdx] = { ...currentOpts[optIdx], text };
      updated[activeSlotIdx].options = currentOpts;
      return updated;
    });
  };

  const handleCorrectOptionChange = (correctIdx) => {
    setQuestionSlots((prev) => {
      const updated = [...prev];
      const currentOpts = updated[activeSlotIdx].options.map((opt, idx) => ({
        ...opt,
        isCorrect: idx === correctIdx,
      }));
      updated[activeSlotIdx].correctOptionIdx = correctIdx;
      updated[activeSlotIdx].options = currentOpts;
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
        addToast('Please upload a valid Excel spreadsheet (.xlsx, .xls, or .csv)', 'error');
        return;
      }
      setExcelFile(file);
      addToast(`Attached: ${file.name}`, 'info');
    }
  };

  const onSubmit = async (data) => {
    try {
      // Formulate questions array from filled slots
      const validQuestions = questionSlots
        .filter((slot) => slot.questionText && slot.questionText.trim() !== '')
        .map((slot) => ({
          questionText: slot.questionText,
          marks: slot.marks,
          explanation: slot.explanation,
          options: slot.options.map((opt, idx) => ({
            text: opt.text || `Option ${String.fromCharCode(65 + idx)}`,
            isCorrect: idx === slot.correctOptionIdx,
          })),
        }));

      const payload = {
        ...data,
        questions: validQuestions,
      };

      const created = await quizService.createQuiz(payload, excelFile);

      if (excelFile) {
        addToast('Quiz created and 20 random questions imported from Excel!', 'success');
      } else if (validQuestions.length > 0) {
        addToast(`Quiz created with ${validQuestions.length} custom questions!`, 'success');
      } else {
        addToast('Quiz created successfully!', 'success');
      }
      navigate(`/admin/quizzes/${created.id}/questions`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create quiz.', 'error');
    }
  };

  const activeSlot = questionSlots[activeSlotIdx];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Header
        title="Create New Quiz"
        subtitle="Configure assessment metadata, write custom question slots, or import from Excel."
        action={
          <Button variant="secondary" icon={ArrowLeft} onClick={() => navigate('/admin/quizzes')}>
            Back to Quizzes
          </Button>
        }
      />

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Metadata Section */}
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider border-b border-dark-border pb-2">
              1. Quiz Basic Information
            </h3>

            <Input
              label="Quiz Title"
              placeholder="e.g., Modern JavaScript Async Patterns"
              {...register('title', { required: 'Quiz title is required' })}
              error={errors.title?.message}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide a comprehensive summary of what skills this quiz assesses..."
                className="w-full bg-dark-bg border border-dark-border text-slate-100 rounded-ms p-3 text-sm focus:outline-none focus:border-brand-cyan transition-colors"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <span className="text-xs text-brand-red font-medium">{errors.description.message}</span>}
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
              <Input
                label="Duration (Minutes)"
                type="number"
                {...register('duration', { required: true, min: 1 })}
                error={errors.duration && 'Duration required'}
              />

              <Input
                label="Passing Percentage (%)"
                type="number"
                {...register('passingPercentage', { required: true, min: 1, max: 100 })}
                error={errors.passingPercentage && 'Valid percentage 1-100 required'}
              />

              <Input
                label="Maximum Allowed Attempts"
                type="number"
                {...register('maxAttempts', { required: true, min: 1 })}
                error={errors.maxAttempts && 'Attempts required'}
              />
            </div>
          </div>

          {/* Excel Import Container */}
          <div className="p-4 bg-dark-card/60 border border-dark-border rounded-ms-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-200 font-bold text-xs uppercase tracking-wider">
                <FileSpreadsheet className="w-4 h-4 text-brand-cyan" />
                <span>Bulk Import via Excel (.xlsx)</span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon={Download}
                onClick={() => quizService.downloadExcelTemplate()}
              >
                Download Template (.xlsx)
              </Button>
            </div>
            <p className="text-xs text-slate-400">
              Attach an Excel spreadsheet with questions. The backend will randomly pick <strong>20 questions</strong>.
            </p>

            {excelFile ? (
              <div className="flex items-center justify-between p-3 bg-brand-cyan/10 border border-brand-cyan/30 rounded-ms">
                <div className="flex items-center gap-2 text-xs font-semibold text-brand-cyan">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setExcelFile(null)}
                  className="p-1 text-slate-400 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-dark-border hover:border-brand-cyan/50 rounded-ms cursor-pointer transition-colors bg-dark-bg/40 hover:bg-dark-card/80">
                <UploadCloud className="w-6 h-6 text-brand-cyan mb-1" />
                <span className="text-xs font-semibold text-slate-200">Click to upload Excel spreadsheet (.xlsx, .csv)</span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            )}
          </div>

          {/* Dynamic Question Slots Generator */}
          <div className="space-y-4 pt-4 border-t border-dark-border">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-card p-4 rounded-ms-lg border border-dark-border">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-brand-cyan" />
                  2. Write Questions & Answers Inline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Generate slots to write questions with options right inside this form.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(e.target.value)}
                  className="w-20 bg-dark-bg border border-dark-border rounded-ms px-3 py-1.5 text-xs text-center text-slate-100 font-bold focus:border-brand-cyan"
                  placeholder="20"
                />
                <Button
                  type="button"
                  variant="purple"
                  size="sm"
                  icon={Sparkles}
                  onClick={() => generateSlots(questionCount)}
                >
                  Generate {questionCount} Question Slots
                </Button>
              </div>
            </div>

            {/* Question Slots Navigation Palette */}
            {questionSlots.length > 0 && (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
                  {questionSlots.map((slot, idx) => {
                    const isFilled = slot.questionText && slot.questionText.trim() !== '';
                    const isActive = idx === activeSlotIdx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveSlotIdx(idx)}
                        className={`px-3 py-1.5 rounded text-xs font-bold transition-all relative flex items-center gap-1 flex-shrink-0 ${
                          isActive
                            ? 'bg-brand-cyan text-slate-950 shadow-ms-glow'
                            : isFilled
                            ? 'bg-brand-green/20 text-brand-greenLight border border-brand-green/40'
                            : 'bg-dark-card border border-dark-border text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>Q{idx + 1}</span>
                        {isFilled && <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
                      </button>
                    );
                  })}
                </div>

                {/* Active Question Slot Card */}
                {activeSlot && (
                  <div className="p-5 bg-dark-card border border-brand-cyan/30 rounded-ms-lg space-y-4">
                    <div className="flex items-center justify-between border-b border-dark-border pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-brand-cyan">
                        Slot {activeSlotIdx + 1} of {questionSlots.length}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          isDisabled={activeSlotIdx === 0}
                          onClick={() => setActiveSlotIdx((prev) => prev - 1)}
                          icon={ChevronLeft}
                        >
                          Prev Slot
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          isDisabled={activeSlotIdx === questionSlots.length - 1}
                          onClick={() => setActiveSlotIdx((prev) => prev + 1)}
                          icon={ChevronRight}
                          iconPosition="right"
                        >
                          Next Slot
                        </Button>
                      </div>
                    </div>

                    <Input
                      label={`Question #${activeSlotIdx + 1} Text`}
                      placeholder="Type the question prompt here..."
                      value={activeSlot.questionText}
                      onChange={(e) => handleSlotFieldChange('questionText', e.target.value)}
                    />

                    {/* Options Grid with Correct Answer Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                        Options (Select the Radio Button for Correct Answer)
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {activeSlot.options.map((opt, optIdx) => {
                          const optionLabel = String.fromCharCode(65 + optIdx);
                          const isCorrect = optIdx === activeSlot.correctOptionIdx;
                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2.5 p-2.5 rounded-ms border transition-all ${
                                isCorrect
                                  ? 'bg-brand-green/15 border-brand-green/40'
                                  : 'bg-dark-bg border-dark-border'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct_opt_${activeSlotIdx}`}
                                checked={isCorrect}
                                onChange={() => handleCorrectOptionChange(optIdx)}
                                className="text-brand-green focus:ring-0 cursor-pointer"
                              />
                              <span className="text-xs font-bold text-slate-400 w-5">{optionLabel}.</span>
                              <input
                                type="text"
                                placeholder={`Option ${optionLabel} text...`}
                                value={opt.text}
                                onChange={(e) => handleOptionTextChange(optIdx, e.target.value)}
                                className="flex-1 bg-transparent text-xs text-slate-100 focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="Marks"
                        type="number"
                        min="1"
                        value={activeSlot.marks}
                        onChange={(e) => handleSlotFieldChange('marks', Number(e.target.value))}
                      />
                      <Input
                        label="Explanation (Optional)"
                        placeholder="Why is this answer correct?"
                        value={activeSlot.explanation}
                        onChange={(e) => handleSlotFieldChange('explanation', e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-dark-border">
            <Select
              label="Initial Status"
              options={[
                { label: 'Draft', value: 'Draft' },
                { label: 'Published', value: 'Published' },
                { label: 'Unpublished', value: 'Unpublished' },
              ]}
              {...register('status')}
            />

            <Input
              label="Thumbnail Image URL (Optional)"
              placeholder="https://images.unsplash.com/..."
              {...register('thumbnail')}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-dark-border">
            <Button variant="ghost" onClick={() => navigate('/admin/quizzes')} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting} icon={Save}>
              Save Quiz & Questions
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
