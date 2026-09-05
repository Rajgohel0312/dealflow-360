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
        console.error(error);

        const statusCode = error.statusCode || 500;

        return res.status(statusCode).json({
            error: error.statusCode
                ? error.message
                : "Internal server error",
        });
    });
};