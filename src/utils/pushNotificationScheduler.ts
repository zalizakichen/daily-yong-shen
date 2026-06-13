import type { ScheduleValue, TimeSlotValue, WeekdayValue } from "../data/schedule";
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

/** 推送触发窗口：应对后台标签页定时器节流 */
export const PUSH_FIRE_WINDOW_MS = 120_000;

function parseTimeSlot(slot: TimeSlotValue): { hour: number; minute: number } {
  const [hour, minute] = slot.split(":").map(Number);
  return { hour, minute };
}

/** 若今天符合预约星期，返回今日预约推送时刻 */
export function getTodayPushDateTime(
  schedule: ScheduleValue,
  now: Date = new Date(),
): Date | null {
  if (schedule.weekdays.length === 0 || schedule.timeSlots.length === 0) {
    return null;
  }

  const jsDay = now.getDay();
  const matchesWeekday = schedule.weekdays.some(
    (weekday) => WEEKDAY_TO_JS[weekday] === jsDay,
  );
  if (!matchesWeekday) return null;

  const slot = schedule.timeSlots[0];
  if (!slot) return null;

  const { hour, minute } = parseTimeSlot(slot);
  const pushTime = new Date(now);
  pushTime.setHours(hour, minute, 0, 0);
  return pushTime;
}

export function shouldFireScheduledPush(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  pushHistory: string[],
  now: Date = new Date(),
): boolean {
  if (
    !pushEnabledSince ||
    schedule.weekdays.length === 0 ||
    schedule.timeSlots.length === 0
  ) {
    return false;
  }

  const todayKey = formatDateKey(now);
  if (pushHistory.includes(todayKey)) return false;

  const enabledStart = startOfDay(parseDateKey(pushEnabledSince));
  const todayStart = startOfDay(now);
  if (todayStart.getTime() < enabledStart.getTime()) return false;

  const pushTime = getTodayPushDateTime(schedule, now);
  if (!pushTime) return false;

  const elapsed = now.getTime() - pushTime.getTime();
  return elapsed >= 0 && elapsed < PUSH_FIRE_WINDOW_MS;
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
