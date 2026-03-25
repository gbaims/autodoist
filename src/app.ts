import { Hono } from "hono";

import type { AppConfig } from "./config.ts";
import { registerHealthRoutes } from "./routes/health.ts";
import { registerTodoistWebhookRoutes } from "./routes/webhooks/todoist.ts";

function createApp(config: AppConfig): Hono {
  const app = new Hono();

  app.get("/", (c) => {
    return c.text("Autodoist is running.");
  });

  registerHealthRoutes(app);
  registerTodoistWebhookRoutes(app, config);

  return app;
}

export { createApp };
