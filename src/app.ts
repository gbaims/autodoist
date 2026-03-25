import { Hono } from "hono";

import { registerHealthRoutes } from "./routes/health.ts";
import { registerTodoistWebhookRoutes } from "./routes/webhooks/todoist.ts";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Autodoist is running.");
});

registerHealthRoutes(app);
registerTodoistWebhookRoutes(app);

export { app };
