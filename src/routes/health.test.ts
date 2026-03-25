import { assertEquals, assertExists, assertStringIncludes } from "@std/assert";

import { createApp } from "../app.ts";

const app = createApp({
  todoist: {
    clientSecret: "test-secret",
  },
});

Deno.test("GET /health returns service health data", async () => {
  const response = await app.request("/health");
  const payload = await response.json();

  assertEquals(response.status, 200);
  assertStringIncludes(
    response.headers.get("content-type") ?? "",
    "application/json",
  );
  assertEquals(payload.status, "ok");
  assertEquals(payload.service, "autodoist");
  assertExists(payload.timestamp);
});
