import { Hono } from "hono";

import { todoistWebhookRoutes } from "./todoist.ts";

const webhookRoutes = new Hono();

webhookRoutes.route("/", todoistWebhookRoutes);

export { webhookRoutes };
