import * as authService from "./auth.services.js";
import AppError from "../../shared/errors/AppError.js";
import { recordAuthFailure, resetAuthFailure } from "../../middleware/progressiveAuthDelay.middleware.js";
import { revokeToken } from "../../middleware/tokenBlacklist.middleware.js";
import { sendSuccess, sendError } from "../../shared/utils/response.js";
import { asyncHandler } from "../../shared/utils/asyncHandler.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = await authService.registerUser(name, email, password);
    await resetAuthFailure(req);
    return sendSuccess(res, { user }, "User registered successfully", 201);
  } catch (error) {
    await recordAuthFailure(req);
    return sendError(res, error.message || "Registration failed", error.statusCode || 400);
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await authService.loginUser(email, password);
    await resetAuthFailure(req);
    return sendSuccess(res, { token: result.token, user: result.user }, "User logged in successfully", 200);
  } catch (error) {
    await recordAuthFailure(req);
    return sendError(res, error.message || "Invalid email or password", error.statusCode || 401);
  }
});

export const logoutUser = asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.split(" ")[1];
    await revokeToken(token);
  }
  return sendSuccess(res, {}, "User logged out successfully");
});

export const profile = asyncHandler(async (req, res) => {
  const id = req.user?.id;
  if (!id) {
    throw new AppError("Authentication Required", 401);
  }
  const user = await authService.profile(id);
  return sendSuccess(res, { user }, "Profile fetched successfully");
});
