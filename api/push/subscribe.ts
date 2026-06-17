import type { VercelRequest, VercelResponse } from "@vercel/node";
import { isKvConfigured, upsertSubscription } from "../_pushBackend";
import type { SubscribeRequestBody } from "../_pushBackend";

function isValidBody(body: unknown): body is SubscribeRequestBody {
  if (!body || typeof body !== "object") return false;
  const value = body as SubscribeRequestBody;
  return (
    typeof value.subscription?.endpoint === "string" &&
    typeof value.subscription?.keys?.p256dh === "string" &&
    typeof value.subscription?.keys?.auth === "string" &&
    typeof value.timezone === "string" &&
    typeof value.pushEnabledSince === "string" &&
    value.schedule !== null &&
    typeof value.schedule === "object" &&
    value.profile !== null &&
    typeof value.profile === "object"
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isKvConfigured()) {
    res.status(503).json({
      error: "Push storage is not configured. Please connect Upstash Redis.",
    });
    return;
  }

  if (!isValidBody(req.body)) {
    res.status(400).json({ error: "Invalid subscription payload" });
    return;
  }

  try {
    const record = await upsertSubscription(req.body);
    res.status(200).json({
      id: record.id,
      pushRecords: record.pushRecords,
    });
  } catch (error) {
    console.error("Failed to save push subscription", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
}
