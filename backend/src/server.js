import { env } from "./config/env.js";
import pool, { isConnected } from "./infrastructure/database/database.js";
import redisClient from "./infrastructure/redis/redis.client.js";
import { loadRoles } from "./shared/constants/roles.js";

const port = env.port;

const connected = await isConnected();

await loadRoles();

const app = (await import("./app.js")).default;

const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log("Database connected:", connected);
});

// Graceful Shutdown handling
const handleShutdown = (signal) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
  
  if (server && server.close) {
    server.close(async () => {
      console.log("🔌 HTTP Server closed.");
      try {
        await pool.end();
        console.log("🐘 PostgreSQL connection pool closed.");
        if (redisClient) {
          await redisClient.quit();
          console.log("🔴 Redis client disconnected.");
        }
      } catch (err) {
        console.error("Error during graceful shutdown:", err.message);
      }
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on("SIGINT", () => handleShutdown("SIGINT"));
process.on("SIGTERM", () => handleShutdown("SIGTERM"));
