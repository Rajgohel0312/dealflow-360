import { query } from '../../infrastructure/database/index.js';

export const baseRepository = (tableName) => ({
  async findById(id, selectFields = '*') {
    const sql = `SELECT ${selectFields} FROM ${tableName} WHERE id = $1 LIMIT 1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async findAll(selectFields = '*', orderBy = 'created_at DESC') {
    const sql = `SELECT ${selectFields} FROM ${tableName} ORDER BY ${orderBy}`;
    const res = await query(sql, []);
    return res.rows;
  },

  async findOneByField(field, value, selectFields = '*') {
    const sql = `SELECT ${selectFields} FROM ${tableName} WHERE ${field} = $1 LIMIT 1`;
    const res = await query(sql, [value]);
    return res.rows[0] || null;
  },

  async deleteById(id) {
    const sql = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  },

  async count(whereClause = '1=1', params = []) {
    const sql = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
    const res = await query(sql, params);
    return parseInt(res.rows[0].count, 10);
  },

  async paginate(page = 1, limit = 10, selectFields = '*', orderBy = 'created_at DESC', whereClause = '1=1', params = []) {
    const offset = (page - 1) * limit;
    const countSql = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
    const dataSql = `SELECT ${selectFields} FROM ${tableName} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    
    const countRes = await query(countSql, params);
    const totalItems = parseInt(countRes.rows[0].count, 10);

    const dataRes = await query(dataSql, [...params, limit, offset]);

    return {
      items: dataRes.rows,
      meta: {
        page: Number(page),
        limit: Number(limit),
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  },
});
