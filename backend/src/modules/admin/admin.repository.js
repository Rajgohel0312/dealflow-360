import { updateById, findOne } from "../../infrastructure/database/index.js";

export const changeRole = (id, roleId) =>
  updateById("users", id, { role_id: roleId });

export const findRoleById = (roleId) =>
  findOne("roles", { id: roleId }, "id, name");

