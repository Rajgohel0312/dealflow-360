import * as authRepo from "./auth.repository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";

export const registerUser = async (name, email, password) => {
  const isExist = await authRepo.findByEmail(email);

  if (isExist) {
    throw new Error("Email already registered", 422);
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await authRepo.register(name, email, hashedPassword);

  return user;
};

export const loginUser = async (email, password) => {
  const user = await authRepo.findLoginEmail(email);
  console.log(user);

  if (!user) {
    throw new AppError("Invalid Credentials", 401);
  }
  const comparePassword = await bcrypt.compare(password, user.password_hash);

  if (!comparePassword) {
    throw new AppError("Invalid Credentials", 401);
  }

  const token = await jwt.sign(
    { sub: user.id, role: user.role },
    env.jwt_secret,
  );

  return token;
};
