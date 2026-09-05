class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;

    Error.captureStackTrace(this, AppError);
  }
}

// Make AppError available globally
globalThis.AppError = AppError;

export const errorMiddleware = (app) => {
  app.handleErr((error, req, res) => {
    console.error("API Error Captured:", error.message || error);
    if (error.stack) console.error(error.stack);

    const statusCode = error.statusCode || 500;
    const message = error.statusCode ? error.message : "Internal server error";

    if (!res.headersSent) {
      return res.status(statusCode).json({
        success: false,
        message,
        error: message,
      });
    }
  });
};