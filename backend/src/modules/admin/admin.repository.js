import { query } from "../../infrastructure/database/index.js";

export const changeRole = async (id, roleId) => {
  const result = await query(
    "UPDATE users SET role_id=$1 where id=$2 RETURNING *",
    [roleId, id],
  );
  return result.rows[0];
};

export const findRoleById = async (roleId) => {

    const result = await query(
        `
        SELECT id, name
        FROM roles
        WHERE id = $1
        `,
        [roleId]
    );

    return result.rows[0];
};
