import webpush from "web-push";

let configured = false;

export function ensureWebPushConfigured(): void {
  if (configured) return;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

export async function sendWebPush(
  subscription: webpush.PushSubscription,
  payload: Record<string, unknown>,
): Promise<void> {
  ensureWebPushConfigured();
  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 86_400,
  });
}

export { webpush };
