import { Hono } from "hono";

import { healthRoutes } from "./health.ts";

const routes = new Hono();

routes.route("/", healthRoutes);

export { routes };
