import React, { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const QuestionEditorModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      text: '',
      type: 'Multiple Choice',
      marks: 5,
      difficulty: 'Medium',
      explanation: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  useEffect(() => {
    if (initialData) {
      reset({
        text: initialData.text || '',
        type: initialData.type || 'Multiple Choice',
        marks: initialData.marks || 5,
        difficulty: initialData.difficulty || 'Medium',
        explanation: initialData.explanation || '',
        options: initialData.options || [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
        ],
      });
    } else {
      reset({
        text: '',
        type: 'Multiple Choice',
        marks: 5,
        difficulty: 'Medium',
        explanation: '',
        options: [
          { text: '', isCorrect: true },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
          { text: '', isCorrect: false },
        ],
      });
    }
  }, [initialData, reset, isOpen]);

  const handleSelectCorrectOption = (selectedIndex) => {
    fields.forEach((_, idx) => {
      setValue(`options.${idx}.isCorrect`, idx === selectedIndex);
    });
  };

  const onFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Question' : 'Add New Question'}
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <Input
          label="Question Text"
          placeholder="e.g., What is the output of typeof null in JavaScript?"
          {...register('text', { required: 'Question text is required' })}
          error={errors.text?.message}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            label="Question Type"
            options={[
              { label: 'Multiple Choice', value: 'Multiple Choice' },
              { label: 'True / False (Architecture Ready)', value: 'True / False' },
              { label: 'Multiple Correct (Architecture Ready)', value: 'Multiple Correct' },
              { label: 'Fill in the Blanks (Architecture Ready)', value: 'Fill Blanks' },
            ]}
            {...register('type')}
          />
          <Input
            label="Marks"
            type="number"
            {...register('marks', { required: true, min: 1 })}
            error={errors.marks && 'Marks required'}
          />
          <Select
            label="Difficulty"
            options={[
              { label: 'Easy', value: 'Easy' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Hard', value: 'Hard' },
            ]}
            {...register('difficulty')}
          />
        </div>

        {/* Options List */}
        <div className="space-y-2 pt-2 border-t border-dark-border">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Answer Options (Select correct answer ratio button)
            </label>
            {fields.length < 6 && (
              <button
                type="button"
                onClick={() => append({ text: '', isCorrect: false })}
                className="text-xs text-brand-cyan hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            )}
          </div>

          {fields.map((field, idx) => {
            const isCorrect = watch(`options.${idx}.isCorrect`);

            return (
              <div key={field.id} className="flex items-center gap-3 bg-dark-bg p-2 rounded-ms border border-dark-border">
                <button
                  type="button"
                  onClick={() => handleSelectCorrectOption(idx)}
                  className={`p-1.5 rounded-full border transition-all flex items-center justify-center ${
                    isCorrect
                      ? 'bg-brand-green/20 border-brand-green text-brand-greenLight font-bold'
                      : 'border-slate-600 text-slate-500 hover:text-slate-300'
                  }`}
                  title="Mark as correct answer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>

                <input
                  type="text"
                  placeholder={`Option ${idx + 1}`}
                  className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
                  {...register(`options.${idx}.text`, { required: 'Option text is required' })}
                />

                {fields.length > 2 && (
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-1 text-slate-500 hover:text-brand-red transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <Input
          label="Explanation (Shown during answer review)"
          placeholder="Explain why this answer is correct..."
          {...register('explanation')}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
          <Button variant="ghost" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={isLoading}>
            {initialData ? 'Save Changes' : 'Create Question'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
