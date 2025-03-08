// Temporary add on code to sw.js to force updates

/* eslint-disable no-restricted-globals */
self.addEventListener("install", (event) => {
    console.log("[New worker] Service Worker installing.", event);
    self.skipWaiting();
    //   updateServiceWorkerFn();
});

/* eslint-disable no-restricted-globals */
self.addEventListener("activate", (event) => {
    console.log("[New worker] Service Worker activating.");

    // Take control of all clients/tabs immediately
    event.waitUntil(self.clients.claim());
});
