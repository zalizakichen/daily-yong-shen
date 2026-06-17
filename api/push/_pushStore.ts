import {
  isUpstashConfigured,
  upstashDel,
  upstashGetJson,
  upstashSadd,
  upstashSetJson,
  upstashSmembers,
  upstashSrem,
} from "./_upstashRest";
import type {
  PushHistory,
  StoredPushSubscription,
  SubscribeRequestBody,
} from "./_pushTypes";

const SUBS_INDEX_KEY = "push:subscription-ids";

export async function subscriptionIdFromEndpoint(
  endpoint: string,
): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(endpoint).digest("hex").slice(0, 32);
}

export function isKvConfigured(): boolean {
  return isUpstashConfigured();
}

function subscriptionKey(id: string): string {
  return `push:sub:${id}`;
}

export async function listSubscriptionIds(): Promise<string[]> {
  return upstashSmembers(SUBS_INDEX_KEY);
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
  const id = await subscriptionIdFromEndpoint(body.subscription.endpoint);
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
  const ids = await listSubscriptionIds();
  const records = await Promise.all(ids.map((id) => getSubscription(id)));
  return records.filter(
    (record): record is StoredPushSubscription => record !== null,
  );
}
