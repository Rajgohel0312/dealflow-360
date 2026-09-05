import { getClientFromPool } from "./client.js";

export async function transaction(cb) {
  const client = await getClientFromPool();
  try {
    await client.query("BEGIN");

    const result = await cb(client);

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Trannsaction rolled back due to err", error.stack);
    throw error;
  } finally {
    client.release();
  }
}
