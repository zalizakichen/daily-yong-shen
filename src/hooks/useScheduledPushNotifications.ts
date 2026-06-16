import { useEffect, useRef } from "react";
import type { ScheduleValue } from "../data/schedule";
import {
  getPushDateKeys,
  tryRecordTodayPush,
  type PushHistory,
  type PushRecord,
} from "../data/pushHistory";
import {
  getPushCheckIntervalMs,
  shouldFireScheduledPush,
} from "../utils/pushNotificationScheduler";
import { showDailyYongShenNotification } from "../utils/pushNotifications";

type Options = {
  schedule: ScheduleValue;
  pushEnabledSince: string | null;
  pushRecords: PushHistory;
  userName: string;
  /** 推送触发时计算并固化当日用神快照 */
  createPushSnapshot: () => PushRecord;
  onPushTriggered: (nextRecords: PushHistory) => void;
  onOpenDailyPage: () => void;
};

export function useScheduledPushNotifications({
  schedule,
  pushEnabledSince,
  pushRecords,
  userName,
  createPushSnapshot,
  onPushTriggered,
  onOpenDailyPage,
}: Options) {
  const pushRecordsRef = useRef(pushRecords);
  pushRecordsRef.current = pushRecords;

  const createPushSnapshotRef = useRef(createPushSnapshot);
  createPushSnapshotRef.current = createPushSnapshot;

  const onPushTriggeredRef = useRef(onPushTriggered);
  const onOpenDailyPageRef = useRef(onOpenDailyPage);
  onPushTriggeredRef.current = onPushTriggered;
  onOpenDailyPageRef.current = onOpenDailyPage;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.type === "OPEN_DAILY_YONG_SHEN") {
        onOpenDailyPageRef.current();
      }
    };

    navigator.serviceWorker?.addEventListener("message", onMessage);
    return () => navigator.serviceWorker?.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!pushEnabledSince) return;

    let timer: number | undefined;
    let cancelled = false;

    const runCheck = async () => {
      if (cancelled) return;

      const now = new Date();
      if (
        !shouldFireScheduledPush(
          schedule,
          pushEnabledSince,
          getPushDateKeys(pushRecordsRef.current),
          now,
        )
      ) {
        return;
      }

      const snapshot = createPushSnapshotRef.current();
      const nextRecords = tryRecordTodayPush(
        schedule,
        pushEnabledSince,
        pushRecordsRef.current,
        snapshot,
        now,
      );
      if (!nextRecords) return;

      pushRecordsRef.current = nextRecords;
      await showDailyYongShenNotification(userName);
      onPushTriggeredRef.current(nextRecords);
      onOpenDailyPageRef.current();
    };

    const scheduleNext = () => {
      const delay = getPushCheckIntervalMs(schedule, new Date());
      timer = window.setTimeout(async () => {
        await runCheck();
        if (!cancelled) scheduleNext();
      }, delay);
    };

    void runCheck();
    scheduleNext();

    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [schedule, pushEnabledSince, userName]);
}
