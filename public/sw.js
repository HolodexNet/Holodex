// Retire the previous Vue frontend's Workbox worker on existing installations.
// This worker has no fetch handler, so requests use the current network app.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const ownedCaches = (await caches.keys()).filter((key) =>
      (key.startsWith("workbox-precache-") && key.includes(self.registration.scope)) ||
      key.startsWith("holodex-")
    );
    await Promise.all(ownedCaches.map((key) => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});
