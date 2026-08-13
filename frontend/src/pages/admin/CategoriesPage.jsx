import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { Header } from '../../components/layout/Header';
import { SearchBar } from '../../components/common/SearchBar';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorState } from '../../components/common/ErrorState';
import { Plus, Edit2, Trash2, FolderKanban, BookOpen } from 'lucide-react';

export const CategoriesPage = () => {
  const { addToast } = useToast();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  const fetchCategories = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await categoryService.getCategories({ search });
      setCategories(res);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    reset({ name: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description });
    setModalOpen(true);
  };

  const handleSaveCategory = async (data) => {
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, data);
        addToast('Category updated successfully!', 'success');
      } else {
        await categoryService.createCategory(data);
        addToast('New category created!', 'success');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      addToast('Failed to save category.', 'error');
    }
  };

  const handleDeleteCategory = async () => {
    if (!deleteTarget) return;
    try {
      await categoryService.deleteCategory(deleteTarget.id);
      addToast(`Category "${deleteTarget.name}" deleted.`, 'info');
      fetchCategories();
    } catch (err) {
      addToast('Failed to delete category.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <Header
        title="Category Management"
        subtitle="Organize assessment topics and quiz taxonomies."
        action={
          <Button variant="primary" icon={Plus} onClick={handleOpenCreateModal}>
            Create Category
          </Button>
        }
      />

      <div className="flex items-center justify-between gap-4 bg-dark-card border border-dark-border p-4 rounded-ms-lg">
        <div className="w-full max-w-md">
          <SearchBar value={search} onChange={setSearch} placeholder="Search category name or description..." />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Fetching categories..." />
      ) : error ? (
        <ErrorState onRetry={fetchCategories} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} hoverEffect className="flex flex-col justify-between p-5 group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-3 rounded-ms bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/30">
                    <FolderKanban className="w-6 h-6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" icon={Edit2} onClick={() => handleOpenEditModal(cat)} />
                    <Button variant="ghost" size="sm" icon={Trash2} className="hover:text-brand-red" onClick={() => setDeleteTarget(cat)} />
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-100 group-hover:text-brand-cyanLight transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-dark-border flex items-center justify-between text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-brand-purple" /> {cat.quizCount || 0} Quizzes
                </span>
                <span className="text-[11px] text-brand-cyan font-semibold">Active Topic</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit(handleSaveCategory)} className="space-y-4">
          <Input
            label="Category Name"
            placeholder="e.g., JavaScript"
            {...register('name', { required: 'Category name is required' })}
            error={errors.name?.message}
          />
          <Input
            label="Description"
            placeholder="Brief description of the topics covered in this category..."
            {...register('description', { required: 'Description is required' })}
            error={errors.description?.message}
          />
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-dark-border">
            <Button variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isSubmitting}>
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteTarget?.name}"?`}
        variant="danger"
      />
    </div>
  );
};
