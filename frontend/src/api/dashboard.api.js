import api from "./client";

export const getDashboardData = async () => {
  const response = await api.get("/dashboard");
  return response.data;
};
