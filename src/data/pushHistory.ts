import type { ScheduleValue } from "./schedule";
import { formatDateKey } from "../utils/yongShenCalendar";
import { shouldFireScheduledPush } from "../utils/pushNotificationScheduler";

export {
  getTodayPushDateTime,
  shouldFireScheduledPush,
} from "../utils/pushNotificationScheduler";

export function hasRecordedPush(date: Date, pushHistory: string[]): boolean {
  return pushHistory.includes(formatDateKey(date));
}

/** 到达预约时刻后记录今日推送（需 App 在前台或后台运行） */
export function tryRecordTodayPush(
  schedule: ScheduleValue,
  pushEnabledSince: string | null,
  pushHistory: string[],
  now: Date = new Date(),
): string[] | null {
  if (!shouldFireScheduledPush(schedule, pushEnabledSince, pushHistory, now)) {
    return null;
  }

  return [...pushHistory, formatDateKey(now)];
}
