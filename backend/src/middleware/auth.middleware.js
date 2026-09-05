import jwt from 'jsonwebtoken';
import AppError from '../shared/errors/AppError.js';
import { query } from '../infrastructure/database/index.js';

export const authenticateEmployee = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            throw new AppError("Authentication required", 401);
        }

        const [scheme, token] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new AppError("Invalid authorization header", 401);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        let roleName = decoded.role_name;
        if (!roleName && decoded.role_id) {
          const roleRes = await query("SELECT name FROM roles WHERE id = $1 LIMIT 1", [decoded.role_id]);
          if (roleRes.rows[0]) {
            roleName = roleRes.rows[0].name;
          }
        }

        req.user = {
            id: decoded.sub,
            role_id: decoded.role_id,
            role_name: roleName,
        };

        return next();

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

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

export const authenticateAnyUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("Authentication required", 401);
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      throw new AppError("Invalid authorization header", 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.sub,
      role_id: decoded.role_id,
      role_name: decoded.role_name,
      customer_id: decoded.customer_id,
      user_type: decoded.user_type || "EMPLOYEE",
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

/**
 * authorize(...roleNames)
 *
 * Pass ROLE NAME STRINGS (e.g. "Admin", "Sales Rep", "Manager").
 * These are stable across re-seeds — never pass UUIDs here.
 *
 * Examples:
 *   authorize("Admin")
 *   authorize("Admin", "Manager", "Finance")
 *   authorize("Admin", "Sales Rep", "Manager", "Finance", "Operations")
 */
export const authorize = (...allowedRoleNames) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Authentication required", 401);
    }

    // Customer tokens skip role-name checks
    if (req.user.user_type === "CUSTOMER") {
      return next();
    }

    const userRoleName = req.user.role_name;

    if (!allowedRoleNames.includes(userRoleName)) {
      throw new AppError(
        "You are not authorized to access this resource",
        403,
      );
    }

    next();
  };
};
