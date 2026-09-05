import { query } from "./query.js";

const EXCLUDED_SYSTEM_KEYS = new Set([
  "socket",
  "res",
  "req",
  "headers",
  "url",
  "method",
  "params",
  "query",
  "rawHeaders",
  "rawTrailers",
  "httpVersion",
  "httpVersionMajor",
  "httpVersionMinor",
  "complete",
  "aborted",
  "upgrade",
  "statusCode",
  "statusMessage",
  "client",
  "parser",
  "user",
  "authorization",
  "body",
  "joinDuplicateHeaders",
  "_events",
  "_eventsCount",
  "_maxListeners",
  "_readableState",
  "_tlsOptions",
  "_connecting",
  "_hadError",
  "_handle",
  "_parent",
  "_host",
  "_sockname",
  "_consuming",
  "_dumped",
]);

/**
 * Filter out system/framework HTTP request objects (like req, body wrapper, Sockets, HTTP headers)
 * so only pure database column fields are passed to SQL queries.
 */
function cleanDataObject(data) {
  if (!data || typeof data !== "object") return {};

  // If data is a framework request object containing a parsed body, extract payload from data.body
  let target = data;
  if (
    data.body &&
    typeof data.body === "object" &&
    !Array.isArray(data.body) &&
    (data.headers || data.socket || data.httpVersion)
  ) {
    target = data.body;
  }

  const clean = {};

  for (const [key, value] of Object.entries(target)) {
    if (EXCLUDED_SYSTEM_KEYS.has(key)) continue;
    if (value === undefined) continue;
    if (typeof value === "function") continue;

    if (value !== null && typeof value === "object") {
      const isDate = value instanceof Date;
      const isArray = Array.isArray(value);
      const isPlainObject =
        Object.prototype.toString.call(value) === "[object Object]";

      if (!isDate && !isArray && !isPlainObject) {
        // Skip complex runtime objects (Socket, HTTPParser, Streams, etc.)
        continue;
      }
    }

    clean[key] = value;
  }

  return clean;
}

/**
 * Tagged template literal for raw SQL with auto-parameterization.
 * Usage:
 *   const result = await sql`SELECT * FROM users WHERE email = ${email} AND is_active = ${true}`;
 *   return result.rows;
 */
export function sql(strings, ...values) {
  let text = "";
  const params = [];

  strings.forEach((str, i) => {
    text += str;
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  });

  return query(text, params);
}

/**
 * Insert a record into a table from a JS object.
 * Usage:
 *   const newUser = await insertOne("users", { name: "Alice", email: "alice@example.com" });
 */
export async function insertOne(table, rawData, returning = "*") {
  const data = cleanDataObject(rawData);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    throw new Error("insertOne requires a non-empty data object");
  }

  const values = Object.values(data);
  const columns = keys.map((k) => `"${k}"`).join(", ");
  const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(", ");

  const text = `
    INSERT INTO ${table} (${columns})
    VALUES (${placeholders})
    RETURNING ${returning}
  `;

  const result = await query(text, values);
  return result.rows[0];
}

/**
 * Update a record by ID dynamically from a JS object.
 * Usage:
 *   const updated = await updateById("customers", customerId, { name: "New Name", phone: "123" });
 */
export async function updateById(table, id, rawData, returning = "*") {
  const data = cleanDataObject(rawData);
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return null;
  }

  const values = [...Object.values(data), id];
  const setClause = keys.map((key, idx) => `"${key}" = $${idx + 1}`).join(", ");
  const idPlaceholder = `$${values.length}`;

  const text = `
    UPDATE ${table}
    SET ${setClause}, updated_at = NOW()
    WHERE id = ${idPlaceholder}
    RETURNING ${returning}
  `;

  const result = await query(text, values);
  return result.rows[0] || null;
}

/**
 * Find one record by conditions object.
 * Usage:
 *   const user = await findOne("users", { email: "alice@example.com", is_active: true });
 */
export async function findOne(table, rawConditions, select = "*") {
  const conditions = cleanDataObject(rawConditions);
  const keys = Object.keys(conditions);

  if (keys.length === 0) {
    throw new Error("findOne requires a non-empty conditions object");
  }

  const values = Object.values(conditions);
  const whereClause = keys
    .map((key, idx) => `"${key}" = $${idx + 1}`)
    .join(" AND ");

  const text = `SELECT ${select} FROM ${table} WHERE ${whereClause} LIMIT 1`;
  const result = await query(text, values);
  return result.rows[0] || null;
}

/**
 * Find multiple records by conditions object with optional pagination/sorting.
 * Usage:
 *   const users = await findMany("users", { is_active: true }, "id, name, email", { orderBy: "created_at DESC", limit: 20 });
 */
export async function findMany(
  table,
  rawConditions = {},
  select = "*",
  options = {},
) {
  const conditions = cleanDataObject(rawConditions);
  const keys = Object.keys(conditions);
  const values = Object.values(conditions);

  let whereClause = "";
  if (keys.length > 0) {
    whereClause =
      "WHERE " +
      keys.map((key, idx) => `"${key}" = $${idx + 1}`).join(" AND ");
  }

  let text = `SELECT ${select} FROM ${table} ${whereClause}`;

  if (options.orderBy) {
    text += ` ORDER BY ${options.orderBy}`;
  }

  if (options.limit) {
    text += ` LIMIT ${parseInt(options.limit, 10)}`;
  }

  if (options.offset) {
    text += ` OFFSET ${parseInt(options.offset, 10)}`;
  }

  const result = await query(text, values);
  return result.rows;
}

/**
 * Delete a record by ID.
 * Usage:
 *   const deleted = await deleteById("users", userId);
 */
export async function deleteById(table, id, returning = "*") {
  const text = `DELETE FROM ${table} WHERE id = $1 RETURNING ${returning}`;
  const result = await query(text, [id]);
  return result.rows[0] || null;
}
