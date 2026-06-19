import { useEffect, useRef } from "react";
import type { AdviceProfile } from "../data/dailyYongShenAdvice";
import type { PushHistory } from "../data/pushHistory";
import type { ScheduleValue } from "../data/schedule";
import {
  fetchRemotePushRecords,
  mergePushRecords,
  syncPushSubscription,
} from "../utils/webPushSubscription";
import { readCachedPushRecords } from "../utils/pushRecordCache";

type UseWebPushSyncOptions = {
  pushEnabledSince: string | null;
  schedule: ScheduleValue;
  userName: string;
  adviceProfile: AdviceProfile;
  pushRecords: PushHistory;
  onPushRecordsSynced: (records: PushHistory) => void;
};

/** 将订阅与预约同步到服务端，并拉取后台推送产生的用神快照 */
export function useWebPushSync({
  pushEnabledSince,
  schedule,
  userName,
  adviceProfile,
  pushRecords,
  onPushRecordsSynced,
}: UseWebPushSyncOptions) {
  const pushRecordsRef = useRef(pushRecords);
  pushRecordsRef.current = pushRecords;

  const onSyncRef = useRef(onPushRecordsSynced);
  onSyncRef.current = onPushRecordsSynced;

  useEffect(() => {
    if (!pushEnabledSince) return;

    let cancelled = false;

    const sync = async () => {
      const cached = await readCachedPushRecords();
      if (Object.keys(cached).length > 0) {
        const mergedFromCache = mergePushRecords(
          pushRecordsRef.current,
          cached,
        );
        if (
          JSON.stringify(mergedFromCache) !==
          JSON.stringify(pushRecordsRef.current)
        ) {
          pushRecordsRef.current = mergedFromCache;
          onSyncRef.current(mergedFromCache);
        }
      }

      const result = await syncPushSubscription({
        userName,
        schedule,
        pushEnabledSince,
        profile: adviceProfile,
        pushRecords: pushRecordsRef.current,
      });

      if (cancelled) return;

      if (result.pushRecords) {
        const merged = mergePushRecords(
          pushRecordsRef.current,
          result.pushRecords,
        );
        if (JSON.stringify(merged) !== JSON.stringify(pushRecordsRef.current)) {
          pushRecordsRef.current = merged;
          onSyncRef.current(merged);
        }
      }

      const remote = await fetchRemotePushRecords();
      if (cancelled || !remote) return;

      const merged = mergePushRecords(pushRecordsRef.current, remote);
      if (JSON.stringify(merged) !== JSON.stringify(pushRecordsRef.current)) {
        pushRecordsRef.current = merged;
        onSyncRef.current(merged);
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void sync();
      }
    };

    void sync();
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [
    pushEnabledSince,
    schedule,
    userName,
    adviceProfile,
  ]);
}
