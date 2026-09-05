import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import {pool} from "../infrastructure/database/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "../migrations");

async function migrate() {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) NOT NULL UNIQUE,
                executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        `);

        const files = await fs.readdir(migrationsDir);

        const migrationFiles = files
            .filter((file) => file.endsWith(".sql"))
            .sort();

        const result = await client.query(`
            SELECT filename
            FROM schema_migrations
            ORDER BY filename;
        `);

        const executed = new Set(
            result.rows.map((row) => row.filename)
        );

        for (const file of migrationFiles) {
            if (executed.has(file)) {
                console.log(`Skipping: ${file}`);
                continue;
            }

            console.log(`Running: ${file}`);

            const filePath = path.join(migrationsDir, file);
            const sql = await fs.readFile(filePath, "utf8");

            await client.query(sql);

            await client.query(
                `
                INSERT INTO schema_migrations (filename)
                VALUES ($1)
                `,
                [file]
            );

            console.log(`Completed: ${file}`);
        }

        await client.query("COMMIT");

        console.log("Migrations completed successfully.");
    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Migration failed.");
        console.error(error);

        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();  