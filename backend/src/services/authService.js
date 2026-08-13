import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { signToken } from '../utils/jwt.js';

export const registerUser = async ({ name, email, password, role = 'STUDENT' }) => {
  const normalizedEmail = email.trim().toLowerCase();

  // Check if user already exists
  const { data: existingUser } = await db
    .from('users')
    .select('id')
    .eq('email', normalizedEmail)
    .single();

  if (existingUser) {
    throw { message: 'Email address is already registered', code: 'EMAIL_EXISTS', statusCode: 409 };
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, 10);

  // Insert user
  const { data: newUser, error } = await db
    .from('users')
    .insert([
      {
        name,
        email: normalizedEmail,
        password_hash,
        role: role === 'ADMIN' ? 'ADMIN' : 'STUDENT',
        status: 'ACTIVE',
      },
    ])
    .select('id, name, email, role, status, created_at')
    .single();

  if (error || !newUser) {
    throw { message: 'Failed to create user account', code: 'REGISTRATION_FAILED', statusCode: 500 };
  }

  const token = signToken({ userId: newUser.id, role: newUser.role });

  return {
    user: newUser,
    token,
  };
};

export const loginUser = async ({ email, password, requiredRole = null }) => {
  const normalizedEmail = email.trim().toLowerCase();

  const { data: user, error } = await db
    .from('users')
    .select('*')
    .eq('email', normalizedEmail)
    .single();

  if (error || !user) {
    throw { message: 'Invalid email or password credentials', code: 'INVALID_CREDENTIALS', statusCode: 401 };
  }

  if (user.status !== 'ACTIVE') {
    throw { message: 'Account is deactivated. Please contact support.', code: 'ACCOUNT_INACTIVE', statusCode: 403 };
  }

  if (requiredRole && user.role !== requiredRole) {
    throw { message: `Access denied. ${requiredRole} credentials required.`, code: 'UNAUTHORIZED_ROLE', statusCode: 403 };
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) {
    throw { message: 'Invalid email or password credentials', code: 'INVALID_CREDENTIALS', statusCode: 401 };
  }

  const token = signToken({ userId: user.id, role: user.role });

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
  };

  return {
    user: safeUser,
    token,
  };
};
