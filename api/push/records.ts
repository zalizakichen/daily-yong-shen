import type { VercelRequest, VercelResponse } from "@vercel/node";

type PushHistory = Record<string, unknown>;
type StoredPushSubscription = {
  id: string;
  pushRecords: PushHistory;
};

function getUpstashConfig(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function isKvConfigured(): boolean {
  return getUpstashConfig() !== null;
}

async function upstashCommand(...args: string[]): Promise<unknown> {
  const config = getUpstashConfig();
  if (!config) throw new Error("Redis is not configured");
  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
  });
  const text = await response.text();
  const data = JSON.parse(text) as { result?: unknown; error?: string };
  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Upstash failed (${response.status})`);
  }
  return data.result;
}

function subscriptionIdFromEndpoint(endpoint: string): string {
  let hash = 2_166_136_261;
  let hash2 = 5_381;
  for (let i = 0; i < endpoint.length; i++) {
    const code = endpoint.charCodeAt(i);
    hash ^= code;
    hash = Math.imul(hash, 16_777_619);
    hash2 = Math.imul(hash2, 33) ^ code;
  }
  return (
    (hash >>> 0).toString(16).padStart(8, "0") +
    (hash2 >>> 0).toString(16).padStart(8, "0")
  ).slice(0, 32);
}

async function getSubscription(id: string): Promise<StoredPushSubscription | null> {
  const result = await upstashCommand("GET", `push:sub:${id}`);
  if (!result || typeof result !== "string") return null;
  return JSON.parse(result) as StoredPushSubscription;
}

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

  try {
    const id = subscriptionIdFromEndpoint(endpoint);
    const record = await getSubscription(id);
    if (!record) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }
    res.status(200).json({ pushRecords: record.pushRecords });
  } catch (error) {
    console.error("Failed to load push records", error);
    res.status(500).json({ error: "Failed to load push records" });
  }
}
