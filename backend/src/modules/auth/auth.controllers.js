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

