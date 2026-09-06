import { query } from '../../infrastructure/database/index.js';
import CacheService from '../../infrastructure/redis/redis.service.js';

/**
 * Ultra-Fast SELECT Query Helper (DB)
 * Speed up Node/PostgreSQL SELECT query development by 10x without sacrificing raw SQL performance.
 */
class QueryBuilder {
  constructor(tableName) {
    this.tableName = tableName;
    this.selectFields = '*';
    this.whereConditions = [];
    this.joinClauses = [];
    this.queryParams = [];
    this.orderByClause = null;
    this.limitVal = null;
    this.offsetVal = null;
  }

  // 1. Fields selection
  select(fields = '*') {
    this.selectFields = Array.isArray(fields) ? fields.join(', ') : fields;
    return this;
  }

  // 2. Add Join Clause
  join(table, condition, type = 'INNER') {
    this.joinClauses.push(`${type} JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table, condition) {
    return this.join(table, condition, 'LEFT');
  }

  // 3. Where Conditions (Object or String)
  where(conditions, params = []) {
    if (typeof conditions === 'string') {
      this.whereConditions.push(conditions);
      this.queryParams.push(...params);
    } else if (typeof conditions === 'object' && conditions !== null) {
      Object.entries(conditions).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          this.queryParams.push(val);
          this.whereConditions.push(`${key} = $${this.queryParams.length}`);
        }
      });
    }
    return this;
  }

  // 4. Order By
  orderBy(clause = 'created_at DESC') {
    this.orderByClause = clause;
    return this;
  }

  // 5. Limit & Offset
  limit(num) {
    this.limitVal = num;
    return this;
  }

  offset(num) {
    this.offsetVal = num;
    return this;
  }

  // Build SQL String
  buildSql() {
    let sql = `SELECT ${this.selectFields} FROM ${this.tableName}`;
    if (this.joinClauses.length > 0) {
      sql += ` ${this.joinClauses.join(' ')}`;
    }
    if (this.whereConditions.length > 0) {
      sql += ` WHERE ${this.whereConditions.join(' AND ')}`;
    }
    if (this.orderByClause) {
      sql += ` ORDER BY ${this.orderByClause}`;
    }
    if (this.limitVal !== null) {
      sql += ` LIMIT ${this.limitVal}`;
    }
    if (this.offsetVal !== null) {
      sql += ` OFFSET ${this.offsetVal}`;
    }
    return { sql, params: this.queryParams };
  }

  // Execute Query (Returns Array)
  async get() {
    const { sql, params } = this.buildSql();
    const res = await query(sql, params);
    return res.rows;
  }

  // Execute Query (Returns First Single Row or null)
  async first() {
    this.limit(1);
    const rows = await this.get();
    return rows[0] || null;
  }

  // Execute with Redis Caching
  async remember(ttlSeconds = 300, cacheKeyPrefix = null) {
    const { sql, params } = this.buildSql();
    const cacheKey = cacheKeyPrefix 
      ? `dealflow:query:${cacheKeyPrefix}:${JSON.stringify(params)}`
      : `dealflow:query:${this.tableName}:${Buffer.from(sql + JSON.stringify(params)).toString('base64').substring(0, 32)}`;

    return CacheService.remember(cacheKey, ttlSeconds, async () => {
      const res = await query(sql, params);
      return res.rows;
    });
  }

  // --- FAST CONVENIENCE METHODS ---

  // Find by ID in 1 line
  static async findById(tableName, id, selectFields = '*') {
    const res = await query(`SELECT ${selectFields} FROM ${tableName} WHERE id = $1 LIMIT 1`, [id]);
    return res.rows[0] || null;
  }

  // Find single record matching conditions object
  static async findOne(tableName, whereObject = {}, selectFields = '*') {
    const q = new QueryBuilder(tableName).select(selectFields).where(whereObject);
    return q.first();
  }

  // Find all records matching conditions object
  static async findWhere(tableName, whereObject = {}, options = {}) {
    const q = new QueryBuilder(tableName);
    if (options.select) q.select(options.select);
    if (options.orderBy) q.orderBy(options.orderBy);
    if (options.limit) q.limit(options.limit);
    if (options.offset) q.offset(options.offset);
    q.where(whereObject);
    return q.get();
  }

  // Fast Exists Check
  static async exists(tableName, whereObject = {}) {
    const q = new QueryBuilder(tableName).select('1').where(whereObject).limit(1);
    const rows = await q.get();
    return rows.length > 0;
  }

  // Fast Pagination
  static async paginate(tableName, { page = 1, limit = 10, where = {}, select = '*', orderBy = 'created_at DESC' } = {}) {
    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    // Count Total
    const countBuilder = new QueryBuilder(tableName).select('COUNT(*) as count').where(where);
    const countRes = await countBuilder.get();
    const totalItems = parseInt(countRes[0]?.count || 0, 10);

    // Fetch Page Data
    const dataBuilder = new QueryBuilder(tableName)
      .select(select)
      .where(where)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    const items = await dataBuilder.get();

    return {
      items,
      meta: {
        page: pageNum,
        limit: limitNum,
        totalItems,
        totalPages: Math.ceil(totalItems / limitNum),
      },
    };
  }
}

/**
 * Expressive Entry Point Function
 * Usage:
 *   const user = await DB('users').findById(id);
 *   const activeProducts = await DB('products').findWhere({ status: 'ACTIVE' });
 *   const customJoin = await DB('orders').leftJoin('customers', 'orders.customer_id = customers.id').where({'orders.status': 'COMPLETED'}).get();
 */
export function DB(tableName) {
  const instance = new QueryBuilder(tableName);
  
  // Attach convenience static methods to instance call
  instance.findById = (id, selectFields = '*') => QueryBuilder.findById(tableName, id, selectFields);
  instance.findOne = (whereObject, selectFields = '*') => QueryBuilder.findOne(tableName, whereObject, selectFields);
  instance.findWhere = (whereObject, options) => QueryBuilder.findWhere(tableName, whereObject, options);
  instance.exists = (whereObject) => QueryBuilder.exists(tableName, whereObject);
  instance.paginate = (options) => QueryBuilder.paginate(tableName, options);

  return instance;
}

export default DB;
