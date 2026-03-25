import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/health", (c) => {
  return c.json({
    status: "ok",
    service: "autodoist",
    timestamp: Temporal.Now.instant().toString(),
  });
});

export { healthRoutes };
