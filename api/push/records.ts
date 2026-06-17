import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  getSubscription,
  isKvConfigured,
  subscriptionIdFromEndpoint,
} from "./_pushStore";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const endpoint = req.query.endpoint;
  if (typeof endpoint !== "string" || !endpoint) {
    res.status(400).json({ error: "Missing endpoint" });
    return;
  }

  if (!isKvConfigured()) {
    res.status(503).json({ error: "Push storage is not configured" });
    return;
  }

  const id = await subscriptionIdFromEndpoint(endpoint);
  const record = await getSubscription(id);
  if (!record) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }

  res.status(200).json({ pushRecords: record.pushRecords });
}
