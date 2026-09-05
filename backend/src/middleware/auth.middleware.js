import jwt from 'jsonwebtoken';

export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Authentication required", 401);
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new AppError("Invalid authorization header", 401);
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = {
            id: decoded.sub,
            role_id: decoded.role_id,
        };

        next();

    } catch (error) {

        if (error.name === "JsonWebTokenError") {
            throw new AppError("Invalid token", 401);
        }

        if (error.name === "TokenExpiredError") {
            throw new AppError("Token expired", 401);
        }

        throw error;
    }
};


export const authorize = (...allowedRoles) => {
    return (req, res, next) => {

        if (!req.user) {
            throw new AppError("Authentication required", 401);
        }

        if (!allowedRoles.includes(req.user.role_id)) {
            throw new AppError(
                "You are not authorized to access this resource",
                403
            );
        }

        next();
    };
};