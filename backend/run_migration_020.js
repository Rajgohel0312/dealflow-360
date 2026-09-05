import fs from 'fs';
import { query } from './src/infrastructure/database/index.js';

async function runMigration() {
  try {
    console.log('--- APPLYING MIGRATION 020 ---');
    const sqlPath = './src/migrations/020_create_billing_payments_negotiations_upsell.sql';
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    await query(sql, []);
    console.log('✅ Migration 020 applied successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
