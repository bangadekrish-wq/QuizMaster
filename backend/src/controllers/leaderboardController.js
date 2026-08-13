import { db } from '../config/db.js';
import { successResponse } from '../utils/response.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { tab = 'Overall' } = req.query;
    const currentUserId = req.user?.id;

    // Query students and their attempts
    const { data: users, error } = await db
      .from('users')
      .select('id, name, email, attempts(id, percentage, status)')
      .eq('role', 'STUDENT');

    if (error) throw error;

    const ranked = (users || []).map((u) => {
      const attempts = u.attempts || [];
      const completed = attempts.filter((a) => a.percentage !== null);
      const count = completed.length;
      const avgScore =
        count > 0
          ? Number((completed.reduce((acc, curr) => acc + (Number(curr.percentage) || 0), 0) / count).toFixed(1))
          : 0;

      const points = Math.round(avgScore * count * 1.5);

      return {
        studentId: u.id,
        name: u.name,
        avatar: null,
        averageScore: avgScore,
        quizzesCompleted: count,
        points,
        isCurrentUser: u.id === currentUserId,
      };
    });

    // Sort by points / average score descending
    ranked.sort((a, b) => b.points - a.points || b.averageScore - a.averageScore);

    // Assign rank numbers
    const leaderboard = ranked.map((item, idx) => ({
      rank: idx + 1,
      ...item,
    }));

    return successResponse(res, leaderboard, 'Leaderboard retrieved successfully');
  } catch (err) {
    next(err);
  }
};
