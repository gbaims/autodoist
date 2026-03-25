import { Hono } from "hono";

function registerHealthRoutes(app: Hono): void {
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      service: "autodoist",
      timestamp: Temporal.Now.instant().toString(),
    });
  });
}

export { registerHealthRoutes };
