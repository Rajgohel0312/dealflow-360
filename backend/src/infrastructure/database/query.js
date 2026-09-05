import pool from "./database.js";
export async function query(text, params) {
  if (!Array.isArray(params)) {
    throw new Error(
      "Postgres Security Alert:Parameters must be provided as an Array",
    );
  }

  const start = Date.now();

  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log("Excuted query ", { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error("Database query error: ", error.message);
    throw error;
  }
}
