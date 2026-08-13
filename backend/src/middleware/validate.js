import { errorResponse } from '../utils/response.js';

export const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    next();
  } catch (err) {
    const issue = err.errors ? err.errors[0]?.message : 'Invalid request parameters';
    return errorResponse(res, issue, 'VALIDATION_ERROR', 400);
  }
};
