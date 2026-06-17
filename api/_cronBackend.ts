import {
  computeDailyYongShenAdvice,
  snapshotFromAdvice,
  type AdviceProfile,
} from "../src/data/dailyYongShenAdvice";
import type { PushRecord } from "../src/data/pushHistory";
import type { ScheduleValue, WeekdayValue } from "../src/data/schedule";
import { parseDateKey, startOfDay } from "../src/utils/yongShenCalendar";
import {
  CRON_SLOT_GRACE_MINUTES,
  isWithinScheduledSlotGrace,
} from "../src/utils/pushNotificationScheduler";
import type { ServerAdviceProfile } from "./_pushBackend";
import type webpush from "web-push";

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

function toAdviceProfile(profile: ServerAdviceProfile): AdviceProfile {
  return {
    userDayStem: profile.userDayStem,
    birthday: profile.birthday,
    shichenId: profile.shichenId,
    gender: profile.gender as AdviceProfile["gender"],
    fortunateYear: profile.fortunateYear,
    season: profile.season as AdviceProfile["season"],
    direction: profile.direction as AdviceProfile["direction"],
    scene: profile.scene as AdviceProfile["scene"],
    leisure: profile.leisure as AdviceProfile["leisure"],
  };
}

export function buildPushNotificationContent(
  profile: ServerAdviceProfile,
  date: Date,
  userName: string,
): { title: string; body: string; snapshot: PushRecord } {
  const advice = computeDailyYongShenAdvice(date, toAdviceProfile(profile));
  const snapshot = snapshotFromAdvice(advice);
  const greeting = userName.trim()
    ? `${userName.trim()}，`
    : "";

  return {
    title: advice.title,
    body: `${greeting}${advice.summary}`,
    snapshot,
  };
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  weekday: number;
  hour: number;
  minute: number;
};

function getZonedParts(timeZone: string, date = new Date()): ZonedParts {
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

  const weekdayLabel = get("weekday");
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: JS_DAY_FROM_SHORT[weekdayLabel] ?? 0,
    hour: Number(get("hour")),
    minute: Number(get("minute")),
  };
}

function formatDateKeyInTimezone(timeZone: string, date = new Date()): string {
  const zoned = getZonedParts(timeZone, date);
  const month = String(zoned.month).padStart(2, "0");
  const day = String(zoned.day).padStart(2, "0");
  return `${zoned.year}-${month}-${day}`;
}

function matchesScheduleWeekday(
  schedule: ScheduleValue,
  weekday: number,
): boolean {
  return schedule.weekdays.some(
    (item) => WEEKDAY_TO_JS[item] === weekday,
  );
}

export function shouldFireScheduledPushInTimezone(
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

  const todayKey = formatDateKeyInTimezone(timeZone, now);
  if (pushHistory.includes(todayKey)) return false;

  const zoned = getZonedParts(timeZone, now);
  if (!matchesScheduleWeekday(schedule, zoned.weekday)) return false;

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

export function todayDateKeyInTimezone(timeZone: string, now = new Date()): string {
  return formatDateKeyInTimezone(timeZone, now);
}

let configured = false;
let webPushModule: typeof webpush | null = null;

async function getWebPushModule(): Promise<typeof webpush> {
  if (!webPushModule) {
    const module = await import("web-push");
    webPushModule = module.default;
  }
  return webPushModule;
}

async function ensureWebPushConfigured(): Promise<typeof webpush> {
  const webpush = await getWebPushModule();
  if (configured) return webpush;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return webpush;
}

type PushSubscription = webpush.PushSubscription;

export async function sendWebPush(
  subscription: PushSubscription,
  payload: Record<string, unknown>,
): Promise<void> {
  const webpush = await ensureWebPushConfigured();
  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 86_400,
  });
}
