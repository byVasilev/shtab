// Service worker: shows push notifications and opens the site when one is tapped. It caches nothing,
// so the page always loads fresh from the server.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

self.addEventListener("push", e => {
  let m = {};
  try { m = e.data ? e.data.json() : {}; } catch (_) { m = {body: e.data && e.data.text()}; }
  e.waitUntil(self.registration.showNotification(m.title || "Штаб союза", {
    body: m.body || "",
    icon: "art/app/icon-192.png",
    badge: "art/app/icon-192.png",
    tag: m.tag || undefined,
    data: {url: m.url || "./"}
  }));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = new URL(e.notification.data && e.notification.data.url || "./", self.registration.scope).href;
  e.waitUntil((async () => {
    const tabs = await self.clients.matchAll({type: "window", includeUncontrolled: true});
    const open = tabs.find(c => c.url.startsWith(self.registration.scope));
    if (open) { await open.focus(); return open.navigate(url); }
    return self.clients.openWindow(url);
  })());
});
