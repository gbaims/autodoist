import { assertEquals, assertStringIncludes } from "@std/assert";

import { createApp } from "../../app.ts";
import { signPayload } from "./todoist.ts";

const TODOIST_CLIENT_SECRET = "test-secret";

const app = createApp({
  todoist: {
    clientSecret: TODOIST_CLIENT_SECRET,
  },
});

Deno.test("POST /webhooks/todoist accepts a valid signed webhook", async () => {
  const body = JSON.stringify({
    event_name: "item:added",
    event_data: { id: "task-123" },
    version: "9",
  });

  const response = await app.request("/webhooks/todoist", {
    method: "POST",
    body,
    headers: new Headers({
      "Content-Type": "application/json",
      "User-Agent": "Todoist-Webhooks",
      "X-Todoist-Delivery-ID": "delivery-1",
      "X-Todoist-Hmac-SHA256": await signPayload(body, TODOIST_CLIENT_SECRET),
    }),
  });
  const payload = await response.json();

  assertEquals(response.status, 200);
  assertStringIncludes(
    response.headers.get("content-type") ?? "",
    "application/json",
  );
  assertEquals(payload.received, true);
});

Deno.test("POST /webhooks/todoist rejects requests without signature", async () => {
  const response = await app.request("/webhooks/todoist", {
    method: "POST",
    body: JSON.stringify({ event_name: "item:added" }),
    headers: new Headers({
      "Content-Type": "application/json",
      "User-Agent": "Todoist-Webhooks",
    }),
  });
  const payload = await response.json();

  assertEquals(response.status, 401);
  assertEquals(payload.error, "Missing webhook signature.");
});

Deno.test("POST /webhooks/todoist rejects requests with invalid signature", async () => {
  const response = await app.request("/webhooks/todoist", {
    method: "POST",
    body: JSON.stringify({ event_name: "item:added" }),
    headers: new Headers({
      "Content-Type": "application/json",
      "User-Agent": "Todoist-Webhooks",
      "X-Todoist-Hmac-SHA256": "invalid-signature",
    }),
  });
  const payload = await response.json();

  assertEquals(response.status, 401);
  assertEquals(payload.error, "Invalid webhook signature.");
});

Deno.test("POST /webhooks/todoist rejects invalid JSON after signature validation", async () => {
  const body = "not-json";

  const response = await app.request("/webhooks/todoist", {
    method: "POST",
    body,
    headers: new Headers({
      "Content-Type": "application/json",
      "User-Agent": "Todoist-Webhooks",
      "X-Todoist-Hmac-SHA256": await signPayload(body, TODOIST_CLIENT_SECRET),
    }),
  });
  const payload = await response.json();

  assertEquals(response.status, 400);
  assertEquals(payload.error, "Invalid JSON payload.");
});
