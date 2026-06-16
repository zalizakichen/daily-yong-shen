import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import type { PushHistory } from "../src/data/pushHistory";
import type { StoredPushSubscription, SubscribeRequestBody } from "./types";

const SUBS_INDEX_KEY = "push:subscription-ids";

function createRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = createRedis();

export function subscriptionIdFromEndpoint(endpoint: string): string {
  return createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

export function isKvConfigured(): boolean {
  return redis !== null;
}

function subscriptionKey(id: string): string {
  return `push:sub:${id}`;
}

function getRedis(): Redis {
  if (!redis) {
    throw new Error("Redis is not configured");
  }
  return redis;
}

export async function listSubscriptionIds(): Promise<string[]> {
  const ids = await getRedis().smembers<string>(SUBS_INDEX_KEY);
  return ids ?? [];
}

export async function getSubscription(
  id: string,
): Promise<StoredPushSubscription | null> {
  return getRedis().get<StoredPushSubscription>(subscriptionKey(id));
}

export async function removeSubscription(id: string): Promise<void> {
  const client = getRedis();
  await client.del(subscriptionKey(id));
  await client.srem(SUBS_INDEX_KEY, id);
}

export async function upsertSubscription(
  body: SubscribeRequestBody,
): Promise<StoredPushSubscription> {
  const client = getRedis();
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

  await client.set(subscriptionKey(id), record);
  await client.sadd(SUBS_INDEX_KEY, id);
  return record;
}

export async function updatePushRecords(
  id: string,
  pushRecords: PushHistory,
): Promise<void> {
  const existing = await getSubscription(id);
  if (!existing) return;
  await getRedis().set(subscriptionKey(id), {
    ...existing,
    pushRecords,
    updatedAt: new Date().toISOString(),
  });
}

export async function listAllSubscriptions(): Promise<StoredPushSubscription[]> {
  const ids = await listSubscriptionIds();
  const records = await Promise.all(ids.map((id) => getSubscription(id)));
  return records.filter(
    (record): record is StoredPushSubscription => record !== null,
  );
}
