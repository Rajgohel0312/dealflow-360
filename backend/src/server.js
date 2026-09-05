import { env } from "./config/env.js";
import { isConnected } from "./infrastructure/database/database.js";
import { loadRoles } from "./shared/constants/roles.js";

const port = env.port;

const connected = await isConnected();

await loadRoles();

const app = (await import("./app.js")).default;

app.listen(port, () => {
  console.log(`Server is runnning on port ${port}`);
  console.log("Database connected:", connected);
});

