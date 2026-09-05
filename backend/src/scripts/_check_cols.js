import 'dotenv/config';
import pg from 'pg';
const pool = new pg.Pool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASS,port:process.env.DB_PORT,database:process.env.DB_NAME});
const r = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name='product_categories' ORDER BY ordinal_position");
console.log('product_categories columns:', r.rows.map(x=>x.column_name).join(', '));
await pool.end();
