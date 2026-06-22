import {
  isScheduleComplete,
  normalizeSchedule,
  type ScheduleValue,
  type WeekdayValue,
} from "../data/schedule";
import {
  formatDateKey,
  parseDateKey,
  startOfDay,
} from "./yongShenCalendar";

const WEEKDAY_TO_JS: Record<WeekdayValue, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

const PUSH_HOUR = 8;
const PUSH_MINUTE = 0;

/** App 前台打开时，8:00 后宽限窗口（毫秒） */
export const PUSH_FIRE_WINDOW_MS = 15 * 60_000;

/** 当前时刻是否落在 08:00 后的宽限窗口内（前台本地通知用） */
export function isWithinDailyPushGrace(
  hour: number,
  minute: number,
  graceMinutes = 15,
): boolean {
  if (hour !== PUSH_HOUR) return false;
  if (minute < PUSH_MINUTE) return false;
  return minute - PUSH_MINUTE < graceMinutes;
}

/** 若今天符合预约星期，返回今日 08:00 */
export function getTodayPushDateTime(
  schedule: ScheduleValue,
  now: Date = new Date(),
): Date | null {
  const normalized = normalizeSchedule(schedule);
  if (normalized.weekdays.length === 0) return null;

  const jsDay = now.getDay();
  const matchesWeekday = normalized.weekdays.some(
    (weekday) => WEEKDAY_TO_JS[weekday] === jsDay,
  );
  if (!matchesWeekday) return null;

  const pushTime = new Date(now);
  pushTime.setHours(PUSH_HOUR, PUSH_MINUTE, 0, 0);
  return pushTime;
}

export function isTodayScheduledPushDay(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  now: Date = new Date(),
): boolean {
  if (!pushEnabledSince || !isScheduleComplete(schedule)) {
    return false;
  }

  const enabledStart = startOfDay(parseDateKey(pushEnabledSince));
  const todayStart = startOfDay(now);
  if (todayStart.getTime() < enabledStart.getTime()) return false;

  return getTodayPushDateTime(schedule, now) !== null;
}

/** 今日 08:00 已过，应展示当日用神 */
export function hasTodayScheduledPushPassed(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  now: Date = new Date(),
): boolean {
  if (!isTodayScheduledPushDay(schedule, pushEnabledSince, now)) {
    return false;
  }

  const pushTime = getTodayPushDateTime(schedule, now);
  if (!pushTime) return false;

  return now.getTime() >= pushTime.getTime();
}

export function shouldFireScheduledPush(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  pushHistory: string[],
  now: Date = new Date(),
): boolean {
  if (!pushEnabledSince || !isScheduleComplete(schedule)) {
    return false;
  }

  const todayKey = formatDateKey(now);
  if (pushHistory.includes(todayKey)) return false;

  const enabledStart = startOfDay(parseDateKey(pushEnabledSince));
  const todayStart = startOfDay(now);
  if (todayStart.getTime() < enabledStart.getTime()) return false;

  if (!getTodayPushDateTime(schedule, now)) return false;

  return isWithinDailyPushGrace(now.getHours(), now.getMinutes());
}

export function getPushCheckIntervalMs(
  schedule: ScheduleValue,
  now: Date = new Date(),
): number {
  const pushTime = getTodayPushDateTime(schedule, now);
  if (!pushTime) return 60_000;

  const until = pushTime.getTime() - now.getTime();
  if (until <= 5 * 60_000 && until > -PUSH_FIRE_WINDOW_MS) {
    return 5_000;
  }
  return 30_000;
}
