import { verifyToken } from '../utils/jwt.js';
import { errorResponse } from '../utils/response.js';
import { db } from '../config/db.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Authentication token missing or malformed', 'UNAUTHORIZED', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return errorResponse(res, 'Invalid or expired token', 'UNAUTHORIZED', 401);
    }

    const { data: user, error } = await db
      .from('users')
      .select('id, name, email, role, status')
      .eq('id', decoded.userId || decoded.id)
      .single();

    if (error || !user) {
      return errorResponse(res, 'User session invalid or deleted', 'UNAUTHORIZED', 401);
    }

    if (user.status !== 'ACTIVE') {
      return errorResponse(res, 'Your user account is suspended or inactive', 'FORBIDDEN', 403);
    }

    req.user = user;
    next();
  } catch (err) {
    return errorResponse(res, 'Authentication verification failed', 'UNAUTHORIZED', 401);
  }
};

export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return errorResponse(res, 'Access denied: Administrator privileges required', 'FORBIDDEN', 403);
  }
  next();
};

export const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'STUDENT') {
    return errorResponse(res, 'Access denied: Student access required', 'FORBIDDEN', 403);
  }
  next();
};
