self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data?.json() ?? {};
  } catch {
    payload = {};
  }

  const title = payload.title ?? "每日用神";
  const body =
    payload.body ?? "您预约的每日用神已更新，点击查看。";
  const icon = payload.icon ?? "/icons/icon-192.png";
  const pushPayload = payload.payload ?? { type: "daily-yong-shen" };
  const dateKey = pushPayload.dateKey;
  const pushRecord = pushPayload.pushRecord;
  const cacheName = "daily-yong-shen-v1";

  const tasks = [
    self.registration.showNotification(title, {
      body,
      icon,
      badge: icon,
      tag: "daily-yong-shen",
      data: pushPayload,
    }),
  ];

  if (
    typeof dateKey === "string" &&
    pushRecord &&
    typeof pushRecord === "object"
  ) {
    tasks.push(
      caches.open(cacheName).then((cache) =>
        cache.put(
          `/__push-record__/${dateKey}`,
          new Response(JSON.stringify(pushRecord), {
            headers: { "Content-Type": "application/json" },
          }),
        ),
      ),
    );
  }

  event.waitUntil(Promise.all(tasks));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        if (windowClients.length > 0) {
          const client = windowClients[0];
          client.focus();
          client.postMessage({ type: "OPEN_DAILY_YONG_SHEN" });
          return undefined;
        }
        return self.clients.openWindow("/");
      }),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "SHOW_DAILY_YONG_SHEN") return;

  const { title, body, icon } = event.data.payload ?? {};
  event.waitUntil(
    self.registration.showNotification(title ?? "每日用神", {
      body: body ?? "您预约的每日用神已更新，点击查看。",
      icon: icon ?? "/icons/icon-192.png",
      badge: icon ?? "/icons/icon-192.png",
      tag: "daily-yong-shen",
      data: { type: "daily-yong-shen" },
    }),
  );
});
