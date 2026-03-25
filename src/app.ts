import { Hono } from "hono";

import { routes } from "./routes/index.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Autodoist is running.");
});

app.route("/", routes);

export { app };
