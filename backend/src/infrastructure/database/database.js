import pg from "pg";
import { env } from "../../config/env.js";
const { Pool } = pg;

const pool = new Pool({
  host: env.db.host,
  user: env.db.user,
  password: env.db.password,
  port: env.db.port,
  database: env.db.name,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export async function isConnected() {
  try {
    const result = await pool.query(`
      SELECT
        current_database(),
        current_schema()
    `);

    console.log("DB INFO:", result.rows[0]);

    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}
pool.on("error", (err) => {
  console.error("Unexpected pool error:", err.message);
});

export default pool;
