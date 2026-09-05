import cpeak, { cors, parseJSON } from "cpeak";

import appConfig from "./config/app.js";

import authRoutes from "./modules/auth/auth.routes.js";

import { errorMiddleware } from "./middleware/error.middleware.js";

const app = cpeak();

app.beforeEach(
  cors({
    origin: "http://localhost:5173",
    methods: "GET,POST,PUT,PATCH,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  }),
);

app.beforeEach((req, res, next) => {
  console.log("Request URL: " + req.url);
  console.log("Request Method: " + req.method);

  next();
});

app.route("/get", "/health", (req, res) => {
  return res.json({
    message: "ok",
  });
});
app.beforeEach(parseJSON());

authRoutes(app, appConfig.api.prefix);

// Register global error handling
errorMiddleware(app);

export default app;
