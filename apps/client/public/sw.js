/* Rusuh Booking Tiket — web push service worker (RBT-073, E8, D8.2).
 *
 * Served at /sw.js (Expo copies public/ to the web build root). Handles:
 *  - push:            show the notification the BE pushed (title/body/data).
 *  - notificationclick: focus an existing tab or open the notification's
 *                       deepLink (the web counterpart of RBT-072's tap→route).
 *
 * The payload shape matches the shared notification flow: { title, body,
 * data: { deepLink, kind } } — a safe reference, never PII (D7.1).
 */
/* global self, clients */

self.addEventListener("install", () => {
  // Activate immediately so the first page load is covered.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_e) {
    payload = { title: "Rusuh Tiket", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "Rusuh Tiket";
  const options = {
    body: payload.body || "",
    data: payload.data || {},
    tag: (payload.data && payload.data.kind) || undefined,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const deepLink = (event.notification.data && event.notification.data.deepLink) || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Focus an existing tab and navigate it, else open a new one.
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client && deepLink.startsWith("/")) {
              return client.navigate(deepLink);
            }
            return undefined;
          }
        }
        if (clients.openWindow && deepLink.startsWith("/")) {
          return clients.openWindow(deepLink);
        }
        return undefined;
      }),
  );
});
