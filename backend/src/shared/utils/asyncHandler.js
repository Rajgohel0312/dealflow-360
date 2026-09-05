/**
 * Higher-order function to wrap async controller routes and pass errors to global error handling middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
