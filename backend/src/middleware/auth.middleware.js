import jwt from 'jsonwebtoken';

export const authenticateEmployee = (req, res, next) => {
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

export const authenticateCustomer = (req, res, next) => {
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
      process.env.JWT_SECRET,
    );

    if (decoded.user_type !== "CUSTOMER") {
      throw new AppError("Invalid customer token", 401);
    }

    req.user = {
      id: decoded.sub,
      customer_id: decoded.customer_id,
      user_type: decoded.user_type,
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
export const authenticateCustomerPasswordChange = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Invalid token", 401);
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
    );

    if (decoded.user_type !== "CUSTOMER") {
      throw new AppError("Invalid token", 401);
    }

    if (decoded.purpose !== "CHANGE_PASSWORD") {
      throw new AppError("Invalid token", 401);
    }

    req.user = {
      id: decoded.sub,
      customer_id: decoded.customer_id,
      user_type: decoded.user_type,
      purpose: decoded.purpose,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid token", 401);
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
        403,
      );
    }

    next();
  };
};
