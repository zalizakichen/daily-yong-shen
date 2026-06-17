import type { VercelRequest, VercelResponse } from "@vercel/node";

type PushHistory = Record<string, unknown>;
type ScheduleValue = { weekdays: string[]; timeSlots: string[] };
type ServerAdviceProfile = Record<string, unknown>;
type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
  expirationTime?: number | null;
};
type SubscribeRequestBody = {
  subscription: PushSubscriptionPayload;
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: ServerAdviceProfile;
  pushRecords?: PushHistory;
};
type StoredPushSubscription = SubscribeRequestBody & {
  id: string;
  pushRecords: PushHistory;
  updatedAt: string;
};

const SUBS_INDEX_KEY = "push:subscription-ids";

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

function subscriptionKey(id: string): string {
  return `push:sub:${id}`;
}

async function upsertSubscription(
  body: SubscribeRequestBody,
): Promise<StoredPushSubscription> {
  const id = subscriptionIdFromEndpoint(body.subscription.endpoint);
  const existingRaw = await upstashCommand("GET", subscriptionKey(id));
  const existing =
    existingRaw && typeof existingRaw === "string"
      ? (JSON.parse(existingRaw) as StoredPushSubscription)
      : null;
  const pushRecords: PushHistory = {
    ...(existing?.pushRecords ?? {}),
    ...(body.pushRecords ?? {}),
  };
  const record: StoredPushSubscription = {
    ...body,
    id,
    pushRecords,
    updatedAt: new Date().toISOString(),
  };
  await upstashCommand("SET", subscriptionKey(id), JSON.stringify(record));
  await upstashCommand("SADD", SUBS_INDEX_KEY, id);
  return record;
}

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
