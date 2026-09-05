import cpeak, { parseJSON } from "cpeak";

import appConfig from "./config/app.js";


const app = cpeak();

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


export default app;
