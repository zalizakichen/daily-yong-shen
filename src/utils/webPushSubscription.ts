import type { AdviceProfile } from "../data/dailyYongShenAdvice";
import type { PushHistory } from "../data/pushHistory";
import type { ScheduleValue } from "../data/schedule";
import {
  getNotificationPermission,
  registerPushServiceWorker,
  requestNotificationPermission,
} from "./pushNotifications";

type SubscribeRequestBody = {
  subscription: {
    endpoint: string;
    keys: { p256dh: string; auth: string };
    expirationTime?: number | null;
  };
  userName: string;
  timezone: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: {
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
  pushRecords?: PushHistory;
};

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }
  return outputArray;
}

function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Shanghai";
}

function subscriptionToPayload(
  subscription: PushSubscription,
): SubscribeRequestBody["subscription"] {
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error("Invalid push subscription");
  }

  return {
    endpoint: json.endpoint,
    keys: {
      p256dh: json.keys.p256dh,
      auth: json.keys.auth,
    },
    expirationTime: json.expirationTime ?? null,
  };
}

async function fetchVapidPublicKey(): Promise<string | null> {
  try {
    const response = await fetch("/api/push/vapid-public-key");
    if (!response.ok) return null;
    const data = (await response.json()) as { publicKey?: string };
    return data.publicKey ?? null;
  } catch {
    return null;
  }
}

export async function subscribeToWebPush(): Promise<PushSubscription | null> {
  if (!("PushManager" in window)) return null;

  const permission = await requestNotificationPermission();
  if (permission !== "granted") return null;

  const registration = await registerPushServiceWorker();
  if (!registration) return null;

  const publicKey = await fetchVapidPublicKey();
  if (!publicKey) return null;

  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;

  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
}

export async function syncPushSubscription(input: {
  userName: string;
  schedule: ScheduleValue;
  pushEnabledSince: string;
  profile: AdviceProfile;
  pushRecords: PushHistory;
}): Promise<{ pushRecords?: PushHistory; synced: boolean }> {
  if (!input.pushEnabledSince) {
    return { synced: false };
  }

  if (getNotificationPermission() !== "granted") {
    return { synced: false };
  }

  let subscription: PushSubscription | null = null;
  try {
    subscription = await subscribeToWebPush();
  } catch {
    return { synced: false };
  }

  if (!subscription) {
    return { synced: false };
  }

  const body: SubscribeRequestBody = {
    subscription: subscriptionToPayload(subscription),
    userName: input.userName,
    timezone: getUserTimezone(),
    schedule: input.schedule,
    pushEnabledSince: input.pushEnabledSince,
    profile: {
      userDayStem: input.profile.userDayStem,
      birthday: input.profile.birthday,
      shichenId: input.profile.shichenId,
      gender: input.profile.gender,
      fortunateYear: input.profile.fortunateYear,
      season: input.profile.season,
      direction: input.profile.direction,
      scene: input.profile.scene,
      leisure: input.profile.leisure,
    },
    pushRecords: input.pushRecords,
  };

  try {
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return { synced: false };
    }

    const data = (await response.json()) as { pushRecords?: PushHistory };
    return { synced: true, pushRecords: data.pushRecords };
  } catch {
    return { synced: false };
  }
}

export async function fetchRemotePushRecords(): Promise<PushHistory | null> {
  if (!("PushManager" in window)) return null;

  const registration = await navigator.serviceWorker.ready.catch(() => null);
  if (!registration) return null;

  const subscription = await registration.pushManager.getSubscription();
  if (!subscription?.endpoint) return null;

  try {
    const url = `/api/push/records?endpoint=${encodeURIComponent(subscription.endpoint)}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = (await response.json()) as { pushRecords?: PushHistory };
    return data.pushRecords ?? null;
  } catch {
    return null;
  }
}

export function mergePushRecords(
  local: PushHistory,
  remote: PushHistory,
): PushHistory {
  return { ...local, ...remote };
}
