import type { VercelRequest, VercelResponse } from "@vercel/node";
import { buildPushNotificationContent } from "../../server/computePushAdvice";
import {
  listAllSubscriptions,
  removeSubscription,
  updatePushRecords,
} from "../../server/pushStore";
import {
  shouldFireScheduledPushInTimezone,
  todayDateKeyInTimezone,
} from "../../server/scheduler";
import { sendWebPush } from "../../server/webPush";

function isAuthorizedCron(req: VercelRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return process.env.NODE_ENV !== "production";
  const auth = req.headers.authorization;
  return auth === `Bearer ${secret}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  if (!isAuthorizedCron(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const subscriptions = await listAllSubscriptions();
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const record of subscriptions) {
    const pushHistory = Object.keys(record.pushRecords);
    const shouldFire = shouldFireScheduledPushInTimezone(
      record.schedule,
      record.pushEnabledSince,
      pushHistory,
      record.timezone,
    );

    if (!shouldFire) {
      skipped += 1;
      continue;
    }

    const now = new Date();
    const dateKey = todayDateKeyInTimezone(record.timezone, now);
    const { title, body, snapshot } = buildPushNotificationContent(
      record.profile,
      now,
      record.userName,
    );

    try {
      await sendWebPush(record.subscription, {
        title,
        body,
        icon: "/icons/icon-192.png",
        payload: {
          type: "daily-yong-shen",
          dateKey,
          pushRecord: snapshot,
        },
      });

      await updatePushRecords(record.id, {
        ...record.pushRecords,
        [dateKey]: snapshot,
      });
      sent += 1;
    } catch (error) {
      const statusCode =
        error && typeof error === "object" && "statusCode" in error
          ? Number((error as { statusCode: number }).statusCode)
          : 0;

      if (statusCode === 404 || statusCode === 410) {
        await removeSubscription(record.id);
      }

      console.error(`Failed to push to ${record.id}`, error);
      failed += 1;
    }
  }

  res.status(200).json({
    checked: subscriptions.length,
    sent,
    skipped,
    failed,
  });
}
