import api from "./client";

export const getSystemUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};

export const getSystemRoles = async () => {
  const response = await api.get("/admin/roles");
  return response.data;
};

export const updateUserRole = async (userId, roleId) => {
  const response = await api.patch(`/admin/users/${userId}/role`, { roleId });
  return response.data;
};
