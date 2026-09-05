/**
 * Standardized API Response Utilities
 */

export const sendSuccess = (res, data = {}, message = 'Success', statusCode = 200, meta = undefined) => {
  const payload = {
    success: true,
    message,
    ...(data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0 ? data : { data }),
  };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = {
    success: false,
    message,
  };
  if (errors) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
};
