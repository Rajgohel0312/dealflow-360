/**
 * Higher-order function to wrap async controller routes and pass errors to global error handling middleware
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === "function") {
      next(err);
    } else {
      const statusCode = err.statusCode || 500;
      const message = err.message || "Internal server error";
      console.error(`[AsyncHandler Error ${statusCode}]:`, message);
      if (res && !res.headersSent) {
        return res.status(statusCode).json({
          success: false,
          message,
          error: message,
        });
      }
    }
  });
};
