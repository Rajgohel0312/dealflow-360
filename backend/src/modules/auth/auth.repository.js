import { sql, findOne } from "../../infrastructure/database/index.js";

export const findByEmail = (email) =>
  findOne("users", { email }, "id, email, name");

export const findLoginEmail = (email) =>
  findOne("users", { email }, "id, email, name, password_hash, role_id");

export const findById = async (id) => {
  const result = await sql`
    SELECT u.id, u.email, u.name, r.name AS role_name 
    FROM users u 
    JOIN roles r ON u.role_id = r.id 
    WHERE u.id = ${id}
  `;
  return result.rows[0] || null;
};

export const register = async (name, email, password) => {
  const result = await sql`
    INSERT INTO users (name, email, password_hash, role_id)
    VALUES (
      ${name},
      ${email},
      ${password},
      (SELECT id FROM roles WHERE name = 'Sales Rep')
    )
    RETURNING *
  `;
  return result.rows[0];
};

