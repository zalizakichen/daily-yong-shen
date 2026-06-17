import type webpush from "web-push";

let configured = false;
let webPushModule: typeof webpush | null = null;

async function getWebPushModule(): Promise<typeof webpush> {
  if (!webPushModule) {
    const module = await import("web-push");
    webPushModule = module.default;
  }
  return webPushModule;
}

export async function ensureWebPushConfigured(): Promise<typeof webpush> {
  const webpush = await getWebPushModule();
  if (configured) return webpush;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:admin@example.com";

  if (!publicKey || !privateKey) {
    throw new Error("VAPID keys are not configured");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return webpush;
}

export function getVapidPublicKey(): string | null {
  return process.env.VAPID_PUBLIC_KEY ?? null;
}

type PushSubscription = webpush.PushSubscription;

export async function sendWebPush(
  subscription: PushSubscription,
  payload: Record<string, unknown>,
): Promise<void> {
  const webpush = await ensureWebPushConfigured();
  await webpush.sendNotification(subscription, JSON.stringify(payload), {
    TTL: 86_400,
  });
}
