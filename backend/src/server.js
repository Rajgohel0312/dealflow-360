import app from "./app.js";
import { env } from "./config/env.js";
import { isConnected } from "./infrastructure/database/database.js";
const port = env.port;

const connected = await isConnected();

app.listen(port, () => {
  console.log(`Server is runnning on port ${port}`);

  console.log("Database connected:", connected);
});
