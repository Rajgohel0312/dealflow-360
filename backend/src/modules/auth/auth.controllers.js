import * as authService from "./auth.services.js";

export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const user = await authService.registerUser(name, email, password);

  return res.status(200).json({
    success: "true",
    message: "User registered",
    user,
  });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const token = await authService.loginUser(email, password);

  return res.status(200).json({
    succes: true,
    message: "User loggedin succesfully",
    token,
  });
};

export const profile = async (req, res) => {
  const id = req.user.id;
  if (!id) {
    throw new AppError("Authentication Required", 401);
  }
  const user = await authService.profile(id);
  return res.status(200).json({
    success: true,
    message: "Profile fetched succesfully",
    user,
  });
};
