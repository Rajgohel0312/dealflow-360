import pool from "./database.js";

export async function getClientFromPool() {
  try {
    const client = await pool.connect();
    return client;
  } catch (error) {
    console.error("Failed to check client from the pool",error.stack);
    throw error;
    
  }
}
