import type { ScheduleValue, TimeSlotValue, WeekdayValue } from "../data/schedule";
import { parseDateKey, startOfDay } from "../src/utils/yongShenCalendar";
import {
  CRON_SLOT_GRACE_MINUTES,
  isWithinScheduledSlotGrace,
} from "../src/utils/pushNotificationScheduler";

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

/** 在用户时区判断当前是否处于预约推送窗口 */
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
