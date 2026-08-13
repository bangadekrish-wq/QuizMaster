import { errorResponse } from '../utils/response.js';

export const errorMiddleware = (err, req, res, next) => {
  console.error('[Unhandled Backend Error]:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const code = err.code || 'INTERNAL_SERVER_ERROR';

  return errorResponse(res, message, code, statusCode);
};
