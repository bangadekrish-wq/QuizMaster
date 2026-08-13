import { registerUser, loginUser } from '../services/authService.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const result = await registerUser({ name, email, password, role: 'STUDENT' });
    return successResponse(res, result, 'Student account registered successfully', 201);
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.message, err.code, err.statusCode);
    }
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return successResponse(res, result, 'Login successful');
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.message, err.code, err.statusCode);
    }
    next(err);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password, requiredRole: 'ADMIN' });
    return successResponse(res, result, 'Admin login successful');
  } catch (err) {
    if (err.statusCode) {
      return errorResponse(res, err.message, err.code, err.statusCode);
    }
    next(err);
  }
};

export const logout = async (req, res) => {
  return successResponse(res, {}, 'Logged out successfully');
};

export const getMe = async (req, res) => {
  return successResponse(res, { user: req.user }, 'Current authenticated user payload');
};
