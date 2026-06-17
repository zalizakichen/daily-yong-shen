export type YongShenOutput = "木" | "火" | "土" | "金" | "水" | "均衡";

export type PushRecord = {
  yongShen: YongShenOutput;
  title: string;
  summary: string;
  detail: string;
};

export type PushHistory = Record<string, PushRecord>;

export type WeekdayValue =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";

export type TimeSlotValue =
  | "06:00"
  | "08:00"
  | "10:00"
  | "12:00"
  | "14:00"
  | "16:00"
  | "18:00";

export type ScheduleValue = {
  weekdays: WeekdayValue[];
  timeSlots: TimeSlotValue[];
};

export type ServerAdviceProfile = {
  userDayStem: string;
  birthday: { year: number; month: number; day: number };
  shichenId: string;
  gender: string;
  fortunateYear: number;
  season: string;
  direction: string;
  scene: string;
  leisure: string;
};

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  keys: PushSubscriptionKeys;
  expirationTime?: number | null;
};

export type StoredPushSubscription = {
  id: string;
  subscription: PushSubscriptionPayload;
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: ServerAdviceProfile;
  pushRecords: PushHistory;
  updatedAt: string;
};

export type SubscribeRequestBody = {
  subscription: PushSubscriptionPayload;
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: ServerAdviceProfile;
  pushRecords?: PushHistory;
};

type UpstashConfig = {
  url: string;
  token: string;
};

/** Supports Upstash integration (UPSTASH_*) and Vercel KV integration (KV_REST_API_*). */
function getUpstashConfig(): UpstashConfig | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return { url: url.replace(/\/$/, ""), token };
}

function isUpstashConfigured(): boolean {
  return getUpstashConfig() !== null;
}

async function upstashRequest(body: unknown): Promise<unknown> {
  const config = getUpstashConfig();
  if (!config) {
    throw new Error("Redis is not configured");
  }

  const response = await fetch(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data: { result?: unknown; error?: string };
  try {
    data = JSON.parse(text) as { result?: unknown; error?: string };
  } catch {
    throw new Error(
      `Upstash request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  if (!response.ok || data.error) {
    throw new Error(
      data.error ??
        `Upstash request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return data.result;
}

async function upstashCommand(...args: string[]): Promise<unknown> {
  return upstashRequest(args);
}

async function upstashSetJson(key: string, value: unknown): Promise<void> {
  await upstashCommand("SET", key, JSON.stringify(value));
}

async function upstashGetJson<T>(key: string): Promise<T | null> {
  const result = await upstashCommand("GET", key);
  if (result === null || result === undefined) return null;
  if (typeof result !== "string") return result as T;
  return JSON.parse(result) as T;
}

async function upstashSmembers(key: string): Promise<string[]> {
  const result = await upstashCommand("SMEMBERS", key);
  if (!Array.isArray(result)) return [];
  return result.filter((item): item is string => typeof item === "string");
}

async function upstashDel(key: string): Promise<void> {
  await upstashCommand("DEL", key);
}

async function upstashSadd(key: string, member: string): Promise<void> {
  await upstashCommand("SADD", key, member);
}

async function upstashSrem(key: string, member: string): Promise<void> {
  await upstashCommand("SREM", key, member);
}

const SUBS_INDEX_KEY = "push:subscription-ids";

export function subscriptionIdFromEndpoint(endpoint: string): string {
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

export function isKvConfigured(): boolean {
  return isUpstashConfigured();
}

function subscriptionKey(id: string): string {
  return `push:sub:${id}`;
}

export async function getSubscription(
  id: string,
): Promise<StoredPushSubscription | null> {
  return upstashGetJson<StoredPushSubscription>(subscriptionKey(id));
}

export async function removeSubscription(id: string): Promise<void> {
  await upstashDel(subscriptionKey(id));
  await upstashSrem(SUBS_INDEX_KEY, id);
}

export async function upsertSubscription(
  body: SubscribeRequestBody,
): Promise<StoredPushSubscription> {
  const id = subscriptionIdFromEndpoint(body.subscription.endpoint);
  const existing = await getSubscription(id);
  const pushRecords: PushHistory = {
    ...(existing?.pushRecords ?? {}),
    ...(body.pushRecords ?? {}),
  };

  const record: StoredPushSubscription = {
    id,
    subscription: body.subscription,
    userName: body.userName,
    timezone: body.timezone,
    schedule: body.schedule,
    pushEnabledSince: body.pushEnabledSince,
    profile: body.profile,
    pushRecords,
    updatedAt: new Date().toISOString(),
  };

  await upstashSetJson(subscriptionKey(id), record);
  await upstashSadd(SUBS_INDEX_KEY, id);
  return record;
}

export async function updatePushRecords(
  id: string,
  pushRecords: PushHistory,
): Promise<void> {
  const existing = await getSubscription(id);
  if (!existing) return;
  await upstashSetJson(subscriptionKey(id), {
    ...existing,
    pushRecords,
    updatedAt: new Date().toISOString(),
  });
}

export async function listAllSubscriptions(): Promise<StoredPushSubscription[]> {
  const ids = await upstashSmembers(SUBS_INDEX_KEY);
  const records = await Promise.all(ids.map((id) => getSubscription(id)));
  return records.filter(
    (record): record is StoredPushSubscription => record !== null,
  );
}
