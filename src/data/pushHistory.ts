import type { YongShenOutput } from "../engine/types";
import { formatDateKey } from "../utils/yongShenCalendar";
import { shouldFireScheduledPush } from "../utils/pushNotificationScheduler";

export { shouldFireScheduledPush } from "../utils/pushNotificationScheduler";

/** 推送时刻固化的用神快照 */
export type PushRecord = {
  yongShen: YongShenOutput;
  title: string;
  summary: string;
  detail: string;
};

/** dateKey → 推送快照 */
export type PushHistory = Record<string, PushRecord>;

export function getPushDateKeys(records: PushHistory): string[] {
  return Object.keys(records);
}

export function hasRecordedPush(date: Date, pushRecords: PushHistory): boolean {
  return formatDateKey(date) in pushRecords;
}

export function getPushRecord(
  date: Date,
  pushRecords: PushHistory,
): PushRecord | null {
  return pushRecords[formatDateKey(date)] ?? null;
}

export function createPushRecord(input: {
  yongShen: YongShenOutput;
  title: string;
  summary: string;
  detail: string;
}): PushRecord {
  return {
    yongShen: input.yongShen,
    title: input.title,
    summary: input.summary,
    detail: input.detail,
  };
}

/** 到达预约时刻后记录今日推送及当日用神快照 */
export function tryRecordTodayPush(
  schedule: Parameters<typeof shouldFireScheduledPush>[0],
  pushEnabledSince: string | null,
  pushRecords: PushHistory,
  snapshot: PushRecord,
  now: Date = new Date(),
): PushHistory | null {
  if (
    !shouldFireScheduledPush(
      schedule,
      pushEnabledSince,
      getPushDateKeys(pushRecords),
      now,
    )
  ) {
    return null;
  }

  const dateKey = formatDateKey(now);
  return {
    ...pushRecords,
    [dateKey]: snapshot,
  };
}

/** 从 localStorage 迁移旧版 string[] 推送日期列表 */
export function normalizePushRecords(raw: unknown): PushHistory {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    return raw as PushHistory;
  }
  return {};
}
