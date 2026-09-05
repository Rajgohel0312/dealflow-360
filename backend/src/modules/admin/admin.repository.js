import { updateById, findOne, query, findMany } from "../../infrastructure/database/index.js";

export const changeRole = (id, roleId) =>
  updateById("users", id, { role_id: roleId });

export const findRoleById = (roleId) =>
  findOne("roles", { id: roleId }, "id, name");

export const findAllUsers = async () => {
  const res = await query(
    `SELECT u.id, u.name, u.email, u.role_id, u.created_at, r.name as role_name
     FROM users u
     LEFT JOIN roles r ON u.role_id = r.id
     ORDER BY u.created_at DESC`,
    []
  );
  return res.rows;
};

export const findAllRoles = async () => {
  return findMany("roles", {}, "id, name", { orderBy: "name ASC" });
};
