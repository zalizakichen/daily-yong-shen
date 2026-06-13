import { useEffect, useRef } from "react";
import type { ScheduleValue } from "../data/schedule";
import { tryRecordTodayPush } from "../data/pushHistory";
import {
  getPushCheckIntervalMs,
  shouldFireScheduledPush,
} from "../utils/pushNotificationScheduler";
import { showDailyYongShenNotification } from "../utils/pushNotifications";

type Options = {
  schedule: ScheduleValue;
  pushEnabledSince: string | null;
  pushHistory: string[];
  userName: string;
  onPushTriggered: (nextHistory: string[]) => void;
  onOpenDailyPage: () => void;
};

export function useScheduledPushNotifications({
  schedule,
  pushEnabledSince,
  pushHistory,
  userName,
  onPushTriggered,
  onOpenDailyPage,
}: Options) {
  const pushHistoryRef = useRef(pushHistory);
  pushHistoryRef.current = pushHistory;

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
          pushHistoryRef.current,
          now,
        )
      ) {
        return;
      }

      const nextHistory = tryRecordTodayPush(
        schedule,
        pushEnabledSince,
        pushHistoryRef.current,
        now,
      );
      if (!nextHistory) return;

      pushHistoryRef.current = nextHistory;
      await showDailyYongShenNotification(userName);
      onPushTriggeredRef.current(nextHistory);
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
