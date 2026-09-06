import DB from './queryBuilder.js';
import { query } from '../../infrastructure/database/index.js';

export const baseRepository = (tableName) => {
  const db = DB(tableName);

  return {
    // 1. Fast SELECT by ID
    async findById(id, selectFields = '*') {
      return db.findById(id, selectFields);
    },

    // 2. Fast SELECT all
    async findAll(selectFields = '*', orderBy = 'created_at DESC') {
      return db.findWhere({}, { select: selectFields, orderBy });
    },

    // 3. Fast SELECT one by field
    async findOneByField(field, value, selectFields = '*') {
      return db.findOne({ [field]: value }, selectFields);
    },

    // 4. Fast SELECT with conditions object
    async findWhere(whereObject = {}, options = {}) {
      return db.findWhere(whereObject, options);
    },

    // 5. Fast Exists check
    async exists(whereObject = {}) {
      return db.exists(whereObject);
    },

    // 6. Fast Redis-Cached SELECT
    async remember(ttlSeconds = 300, whereObject = {}) {
      return DB(tableName).where(whereObject).remember(ttlSeconds);
    },

    // 7. Delete by ID
    async deleteById(id) {
      const sql = `DELETE FROM ${tableName} WHERE id = $1 RETURNING *`;
      const res = await query(sql, [id]);
      return res.rows[0] || null;
    },

    // 8. Count records
    async count(whereClause = '1=1', params = []) {
      const sql = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
      const res = await query(sql, params);
      return parseInt(res.rows[0]?.count || 0, 10);
    },

    // 9. Fast Paginate
    async paginate(page = 1, limit = 10, selectFields = '*', orderBy = 'created_at DESC', whereClause = '1=1', params = []) {
      if (typeof whereClause === 'object') {
        return db.paginate({ page, limit, select: selectFields, orderBy, where: whereClause });
      }
      // Fallback for legacy string whereClause
      const offset = (page - 1) * limit;
      const countSql = `SELECT COUNT(*) FROM ${tableName} WHERE ${whereClause}`;
      const dataSql = `SELECT ${selectFields} FROM ${tableName} WHERE ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      
      const countRes = await query(countSql, params);
      const totalItems = parseInt(countRes.rows[0]?.count || 0, 10);
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

    // Expose raw query builder instance
    db() {
      return DB(tableName);
    }
  };
};

