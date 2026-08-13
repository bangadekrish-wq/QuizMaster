import { db } from '../config/db.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const status = req.query.status || 'All';
    const role = req.query.role || 'All';

    let query = db
      .from('users')
      .select('id, name, email, role, status, created_at', { count: 'exact' });

    if (role && role !== 'All') {
      query = query.eq('role', role.toUpperCase());
    }
    if (status && status !== 'All') {
      query = query.eq('status', status.toUpperCase());
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data: users, count, error } = await query;
    if (error) throw error;

    // Enhance user metric summaries
    const enhancedUsers = await Promise.all(
      (users || []).map(async (u) => {
        const { data: attempts } = await db
          .from('attempts')
          .select('percentage')
          .eq('user_id', u.id)
          .eq('status', 'COMPLETED');

        const attemptedCount = attempts?.length || 0;
        const avgScore =
          attemptedCount > 0
            ? Math.round(attempts.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / attemptedCount)
            : 0;

        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          status: u.status === 'ACTIVE' ? 'Active' : 'Inactive',
          registrationDate: u.created_at,
          quizzesAttempted: attemptedCount,
          averageScore: avgScore,
        };
      })
    );

    return paginatedResponse(res, enhancedUsers, { page, limit, total: count || 0 });
  } catch (err) {
    next(err);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, role, status, created_at')
      .eq('id', id)
      .single();

    if (error || !user) {
      return errorResponse(res, 'User not found', 'USER_NOT_FOUND', 404);
    }

    const { data: attempts } = await db
      .from('attempts')
      .select('id, score, percentage, status, completed_at, quizzes(title)')
      .eq('user_id', id)
      .order('started_at', { ascending: false });

    const history = (attempts || []).map((a) => ({
      id: a.id,
      quizTitle: a.quizzes?.title || 'Assessment',
      score: a.score,
      percentage: Number(a.percentage) || 0,
      date: a.completed_at || new Date().toISOString(),
      status: a.percentage >= 70 ? 'Passed' : 'Failed',
    }));

    const attemptedCount = history.length;
    const avgScore =
      attemptedCount > 0
        ? Math.round(history.reduce((acc, curr) => acc + curr.percentage, 0) / attemptedCount)
        : 0;
    const highestScore = attemptedCount > 0 ? Math.max(...history.map((h) => h.percentage)) : 0;

    return successResponse(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status === 'ACTIVE' ? 'Active' : 'Inactive',
        registrationDate: user.created_at,
        quizzesAttempted: attemptedCount,
        averageScore: avgScore,
        highestScore,
        history,
      },
      'User details retrieved successfully'
    );
  } catch (err) {
    next(err);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const dbStatus = String(status).toUpperCase();

    const { data: updated, error } = await db
      .from('users')
      .update({ status: dbStatus, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('id, name, email, status')
      .single();

    if (error || !updated) {
      return errorResponse(res, 'User status update failed', 'USER_UPDATE_FAILED', 400);
    }

    return successResponse(res, updated, `User status updated to ${dbStatus}`);
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { error } = await db.from('users').delete().eq('id', id);
    if (error) throw error;
    return successResponse(res, { id }, 'User deleted successfully');
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    const { data: updated, error } = await db
      .from('users')
      .update({ name, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select('id, name, email, role, status')
      .single();

    if (error || !updated) {
      return errorResponse(res, 'Profile update failed', 'PROFILE_UPDATE_FAILED', 400);
    }

    return successResponse(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};
