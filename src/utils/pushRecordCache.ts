import type { PushHistory, PushRecord } from "../data/pushHistory";

const CACHE_NAME = "daily-yong-shen-v1";
const CACHE_PATH_PREFIX = "/__push-record__/";

function cachePathForDateKey(dateKey: string): string {
  return `${CACHE_PATH_PREFIX}${dateKey}`;
}

export async function readCachedPushRecords(): Promise<PushHistory> {
  if (!("caches" in window)) return {};

  try {
    const cache = await caches.open(CACHE_NAME);
    const requests = await cache.keys();
    const records: PushHistory = {};

    for (const request of requests) {
      const url = new URL(request.url);
      if (!url.pathname.startsWith(CACHE_PATH_PREFIX)) continue;

      const dateKey = url.pathname.slice(CACHE_PATH_PREFIX.length);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) continue;

      const response = await cache.match(request);
      if (!response) continue;

      records[dateKey] = (await response.json()) as PushRecord;
    }

    return records;
  } catch {
    return {};
  }
}

export async function writeCachedPushRecord(
  dateKey: string,
  record: PushRecord,
): Promise<void> {
  if (!("caches" in window)) return;

  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      cachePathForDateKey(dateKey),
      new Response(JSON.stringify(record), {
        headers: { "Content-Type": "application/json" },
      }),
    );
  } catch {
    // Ignore cache write failures.
  }
}
