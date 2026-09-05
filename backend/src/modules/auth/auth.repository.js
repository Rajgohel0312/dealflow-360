import { query } from "../../infrastructure/database/index.js";

export const findByEmail = async (email) => {
  const result = await query("SELECT id,email,name from users where email=$1", [
    email,
  ]);
  return result.rows[0];
};

export const findLoginEmail = async (email) => {
  const result = await query(
    "SELECT id,email,name,password_hash,role_id from users where email=$1",
    [email],
  );
  return result.rows[0];
};
export const findById = async (id) => {
  const result = await query(
    "SELECT u.id,u.email,u.name,r.name AS role_name FROM users u JOIN roles r ON u.role_id =r.id WHERE u.id =$1",
    [id],
  );
  return result.rows[0];
};

export const register = async (name, email, password) => {
  const result = await query(
    `
        INSERT INTO users (
            name,
            email,
            password_hash,
            role_id
        )
        VALUES (
            $1,
            $2,
            $3,
            (
                SELECT id
                FROM roles
                WHERE name = 'Sales Rep'
            )
        )
        RETURNING *
        `,
    [name, email, password],
  );

  return result.rows[0];
};
