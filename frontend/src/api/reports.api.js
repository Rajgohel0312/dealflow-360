import api from "./client";

export const getExecutiveDashboardReports = async () => {
  const response = await api.get("/reports/dashboard");
  return response.data;
};
