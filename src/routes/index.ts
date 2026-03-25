import { Hono } from "hono";

import { healthRoutes } from "./health.ts";
import { webhookRoutes } from "./webhooks/index.ts";

const routes = new Hono();

routes.route("/", healthRoutes);
routes.route("/webhooks", webhookRoutes);

export { routes };
