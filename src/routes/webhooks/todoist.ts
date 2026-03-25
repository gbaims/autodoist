import { Hono } from "hono";

const TODOIST_SIGNATURE_HEADER = "X-Todoist-Hmac-SHA256";
const TODOIST_DELIVERY_ID_HEADER = "X-Todoist-Delivery-ID";
const TODOIST_USER_AGENT_HEADER = "User-Agent";
const TODOIST_CLIENT_SECRET_ENV = "TODOIST_CLIENT_SECRET";

type TodoistWebhookEvent = {
  event_name?: string;
  event_data?: {
    id?: string;
  };
  version?: string;
};

function registerTodoistWebhookRoutes(app: Hono): void {
  app.post("/webhooks/todoist", async (c) => {
    const signature = c.req.header(TODOIST_SIGNATURE_HEADER);
    const deliveryId = c.req.header(TODOIST_DELIVERY_ID_HEADER) ?? "unknown";
    const userAgent = c.req.header(TODOIST_USER_AGENT_HEADER) ?? "unknown";
    const body = await c.req.raw.text();
    const bodyBytes = new TextEncoder().encode(body).byteLength;

    if (!signature) {
      console.warn("Todoist webhook missing signature", {
        source: "todoist-webhook",
        route: "/webhooks/todoist",
        deliveryId,
        userAgent,
        bodyBytes,
      });

      return c.json({ error: "Missing webhook signature." }, 401);
    }

    const clientSecret = Deno.env.get(TODOIST_CLIENT_SECRET_ENV);

    if (!clientSecret) {
      console.error("Todoist webhook secret is not configured", {
        source: "todoist-webhook",
        route: "/webhooks/todoist",
        deliveryId,
      });

      return c.json({ error: "Webhook secret is not configured." }, 500);
    }

    const expectedSignature = await signPayload(body, clientSecret);

    if (!timingSafeEqual(signature, expectedSignature)) {
      console.warn("Todoist webhook signature mismatch", {
        source: "todoist-webhook",
        route: "/webhooks/todoist",
        deliveryId,
        userAgent,
        bodyBytes,
        signatureValid: false,
      });

      return c.json({ error: "Invalid webhook signature." }, 401);
    }

    let payload: TodoistWebhookEvent;

    try {
      payload = JSON.parse(body) as TodoistWebhookEvent;
    } catch (_error) {
      console.warn("Todoist webhook payload is not valid JSON", {
        source: "todoist-webhook",
        route: "/webhooks/todoist",
        deliveryId,
        userAgent,
        bodyBytes,
        signatureValid: true,
      });

      return c.json({ error: "Invalid JSON payload." }, 400);
    }

    console.info("Todoist webhook received", {
      source: "todoist-webhook",
      route: "/webhooks/todoist",
      deliveryId,
      userAgent,
      bodyBytes,
      signatureValid: true,
      eventName: payload.event_name ?? "unknown",
      eventVersion: payload.version ?? "unknown",
      resourceId: payload.event_data?.id ?? "unknown",
    });

    return c.json({ received: true }, 200);
  });
}

async function signPayload(payload: string, secret: string): Promise<string> {
  const secretBytes = new TextEncoder().encode(secret);
  const payloadBytes = new TextEncoder().encode(payload);
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    secretBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, payloadBytes);

  return toBase64(new Uint8Array(signature));
}

function timingSafeEqual(left: string, right: string): boolean {
  const leftBytes = new TextEncoder().encode(left);
  const rightBytes = new TextEncoder().encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < leftBytes.length; index += 1) {
    result |= leftBytes[index] ^ rightBytes[index];
  }

  return result === 0;
}

function toBase64(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes));
}

export { registerTodoistWebhookRoutes, signPayload };
