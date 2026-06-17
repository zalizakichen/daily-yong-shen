import type { VercelRequest, VercelResponse } from "@vercel/node";

type TimeSlotValue =
  | "06:00"
  | "08:00"
  | "10:00"
  | "12:00"
  | "14:00"
  | "16:00"
  | "18:00";
type WeekdayValue =
  | "mon"
  | "tue"
  | "wed"
  | "thu"
  | "fri"
  | "sat"
  | "sun";
type ScheduleValue = {
  weekdays: WeekdayValue[];
  timeSlots: TimeSlotValue[];
};
type PushRecord = {
  yongShen: string;
  title: string;
  summary: string;
  detail: string;
};
type PushHistory = Record<string, PushRecord>;
type ServerAdviceProfile = {
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
type PushSubscriptionPayload = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};
type StoredPushSubscription = {
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

const SUBS_INDEX_KEY = "push:subscription-ids";
const CRON_SLOT_GRACE_MINUTES = 15;
const WEEKDAY_TO_JS: Record<WeekdayValue, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};
const JS_DAY_FROM_SHORT: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
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

async function getSubscription(id: string): Promise<StoredPushSubscription | null> {
  const result = await upstashCommand("GET", `push:sub:${id}`);
  if (!result || typeof result !== "string") return null;
  return JSON.parse(result) as StoredPushSubscription;
}

async function removeSubscription(id: string): Promise<void> {
  await upstashCommand("DEL", `push:sub:${id}`);
  await upstashCommand("SREM", SUBS_INDEX_KEY, id);
}

async function updatePushRecords(
  id: string,
  pushRecords: PushHistory,
): Promise<void> {
  const existing = await getSubscription(id);
  if (!existing) return;
  await upstashCommand(
    "SET",
    `push:sub:${id}`,
    JSON.stringify({
      ...existing,
      pushRecords,
      updatedAt: new Date().toISOString(),
    }),
  );
}

async function listAllSubscriptions(): Promise<StoredPushSubscription[]> {
  const idsRaw = await upstashCommand("SMEMBERS", SUBS_INDEX_KEY);
  const ids = Array.isArray(idsRaw)
    ? idsRaw.filter((id): id is string => typeof id === "string")
    : [];
  const records = await Promise.all(ids.map((id) => getSubscription(id)));
  return records.filter(
    (record): record is StoredPushSubscription => record !== null,
  );
}

function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isWithinScheduledSlotGrace(
  slot: TimeSlotValue,
  hour: number,
  minute: number,
  graceMinutes = CRON_SLOT_GRACE_MINUTES,
): boolean {
  const [slotHour, slotMinute] = slot.split(":").map(Number);
  if (hour !== slotHour) return false;
  if (minute < slotMinute) return false;
  return minute - slotMinute < graceMinutes;
}

function getZonedParts(timeZone: string, date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: JS_DAY_FROM_SHORT[get("weekday")] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function todayDateKeyInTimezone(timeZone: string, now = new Date()): string {
  const zoned = getZonedParts(timeZone, now);
  const month = String(zoned.month).padStart(2, "0");
  const day = String(zoned.day).padStart(2, "0");
  return `${zoned.year}-${month}-${day}`;
}

function shouldFireScheduledPushInTimezone(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  pushHistory: string[],
  timeZone: string,
  now: Date = new Date(),
): boolean {
  if (
    !pushEnabledSince ||
    schedule.weekdays.length === 0 ||
    schedule.timeSlots.length === 0
  ) {
    return false;
  }
  const todayKey = todayDateKeyInTimezone(timeZone, now);
  if (pushHistory.includes(todayKey)) return false;
  const zoned = getZonedParts(timeZone, now);
  const weekdayMatch = schedule.weekdays.some(
    (item) => WEEKDAY_TO_JS[item] === zoned.weekday,
  );
  if (!weekdayMatch) return false;
  const enabledStart = startOfDay(parseDateKey(pushEnabledSince));
  const todayStart = startOfDay(
    new Date(zoned.year, zoned.month - 1, zoned.day),
  );
  if (todayStart.getTime() < enabledStart.getTime()) return false;
  const slot = schedule.timeSlots[0];
  if (!slot) return false;
  return isWithinScheduledSlotGrace(
    slot,
    zoned.hour,
    zoned.minute,
    CRON_SLOT_GRACE_MINUTES,
  );
}

async function buildPushNotificationContent(
  profile: ServerAdviceProfile,
  date: Date,
  userName: string,
): Promise<{ title: string; body: string; snapshot: PushRecord }> {
  try {
    const { computeDailyYongShenAdvice, snapshotFromAdvice } = await import(
      "../../src/data/dailyYongShenAdvice"
    );
    const advice = computeDailyYongShenAdvice(date, profile as never);
    const snapshot = snapshotFromAdvice(advice);
    const greeting = userName.trim() ? `${userName.trim()}，` : "";
    return {
      title: advice.title,
      body: `${greeting}${advice.summary}`,
      snapshot,
    };
  } catch (error) {
    console.error("Falling back to simple push content", error);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const greeting = userName.trim() ? `${userName.trim()}，` : "";
    const title = `${month}月${day}日每日用神`;
    const summary = "今日用神建议已就绪，点此查看。";
    return {
      title,
      body: `${greeting}${summary}`,
      snapshot: {
        yongShen: "均衡",
        title,
        summary,
        detail: summary,
      },
    };
  }
}

async function sendWebPush(
  subscription: PushSubscriptionPayload,
  payload: Record<string, unknown>,
): Promise<void> {
  const webpush = (await import("web-push")).default;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";
  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 86_400,
  });
}

function isAuthorizedCron(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  return req.headers.authorization === `Bearer ${secret}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedCron(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  if (!isKvConfigured()) {
    res.status(503).json({
      error: "Push storage is not configured. Connect Upstash Redis on Vercel.",
    });
    return;
  }

  if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    res.status(503).json({
      error: "VAPID keys are not configured on Vercel.",
    });
    return;
  }

  try {
    const subscriptions = await listAllSubscriptions();
    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const record of subscriptions) {
      const pushHistory = Object.keys(record.pushRecords);
      const shouldFire = shouldFireScheduledPushInTimezone(
        record.schedule,
        record.pushEnabledSince,
        pushHistory,
        record.timezone,
      );

      if (!shouldFire) {
        skipped += 1;
        continue;
      }

      const now = new Date();
      const dateKey = todayDateKeyInTimezone(record.timezone, now);
      const { title, body, snapshot } = await buildPushNotificationContent(
        record.profile,
        now,
        record.userName,
      );

      try {
        await sendWebPush(record.subscription, {
          title,
          body,
          icon: "/icons/icon-192.png",
          payload: {
            type: "daily-yong-shen",
            dateKey,
            pushRecord: snapshot,
          },
        });

        await updatePushRecords(record.id, {
          ...record.pushRecords,
          [dateKey]: snapshot,
        });
        sent += 1;
      } catch (error) {
        const statusCode =
          error && typeof error === "object" && "statusCode" in error
            ? Number((error as { statusCode: number }).statusCode)
            : 0;

        if (statusCode === 404 || statusCode === 410) {
          await removeSubscription(record.id);
        }

        console.error(`Failed to push to ${record.id}`, error);
        failed += 1;
      }
    }

    res.status(200).json({
      checked: subscriptions.length,
      sent,
      skipped,
      failed,
    });
  } catch (error) {
    console.error("send-pushes cron failed", error);
    res.status(500).json({
      error: "Cron handler failed",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
