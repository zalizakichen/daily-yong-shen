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
      icon: icon ?? "/background.png",
      badge: icon ?? "/background.png",
      tag: "daily-yong-shen",
      data: { type: "daily-yong-shen" },
    }),
  );
});
