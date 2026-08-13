import { db } from '../config/db.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const search = req.query.search || '';
    let query = db.from('categories').select('*').order('name', { ascending: true });
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data: categories, error } = await query;
    if (error) throw error;

    // Enhance with quiz counts
    const enhanced = await Promise.all(
      (categories || []).map(async (cat) => {
        const { count } = await db
          .from('quizzes')
          .select('id', { count: 'exact', head: true })
          .eq('category_id', cat.id);
        return {
          id: cat.id,
          name: cat.name,
          description: cat.description,
          quizCount: count || 0,
        };
      })
    );

    return successResponse(res, enhanced, 'Categories retrieved successfully');
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const { data: category, error } = await db
      .from('categories')
      .insert([{ name, description }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return errorResponse(res, 'Category name already exists', 'CATEGORY_EXISTS', 409);
      }
      throw error;
    }

    return successResponse(res, category, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const { data: category, error } = await db
      .from('categories')
      .update({ name, description, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error || !category) {
      return errorResponse(res, 'Category update failed', 'CATEGORY_UPDATE_FAILED', 400);
    }

    return successResponse(res, category, 'Category updated successfully');
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Check if quizzes depend on category
    const { count } = await db
      .from('quizzes')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id);

    if (count && count > 0) {
      return errorResponse(res, `Cannot delete category: ${count} quizzes depend on it`, 'CATEGORY_IN_USE', 400);
    }

    const { error } = await db.from('categories').delete().eq('id', id);
    if (error) throw error;

    return successResponse(res, { id }, 'Category deleted successfully');
  } catch (err) {
    next(err);
  }
};
