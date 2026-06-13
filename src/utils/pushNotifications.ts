const NOTIFICATION_TAG = "daily-yong-shen";
const ICON_URL = "/background.png";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return Notification.requestPermission();
}

export async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator)) return null;

  try {
    return await navigator.serviceWorker.register("/sw.js");
  } catch {
    return null;
  }
}

function buildNotificationContent(userName: string) {
  const title = "每日用神";
  const body = userName.trim()
    ? `${userName.trim()}，您预约的每日用神已更新，点击查看。`
    : "您预约的每日用神已更新，点击查看。";

  return { title, body };
}

export async function showDailyYongShenNotification(
  userName: string,
): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== "granted") return false;

  const { title, body } = buildNotificationContent(userName);
  const options: NotificationOptions = {
    body,
    icon: ICON_URL,
    badge: ICON_URL,
    tag: NOTIFICATION_TAG,
    data: { type: "daily-yong-shen" },
  };

  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.ready.catch(() => null);
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
  }

  new Notification(title, options);
  return true;
}
