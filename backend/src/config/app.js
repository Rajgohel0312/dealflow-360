import { env } from "./env.js";

const appConfig = {
  name: "Auth",
  environment: env.nodeEnv,
  port: env.port,

  api: {
    prefix: "/api",
  },
};

export default appConfig;
