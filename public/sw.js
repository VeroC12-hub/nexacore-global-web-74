// Minimal service worker for NexaCore.
//
// Purpose: make the site installable as a real app (WebAPK) on Android so it can
// be launched by name (e.g. Google Assistant "Open JARVIS") and added to the home
// screen as a proper standalone app — not just a bookmark shortcut.
//
// Deliberately does NO caching: every request is a plain network fetch (the
// presence of a fetch handler is what satisfies installability). This avoids the
// stale-content / stale-bundle problems that an aggressive cache would cause.

self.addEventListener('install', () => {
  // Activate this SW immediately rather than waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Take control of open pages right away.
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', () => {
  // Network passthrough: do not call event.respondWith(), so the browser handles
  // every request normally (always fresh from the network). The handler exists
  // only to make the app installable.
});

// Web Push: JARVIS's own notifications (reminders, alerts) on the phone.
self.addEventListener('push', (event) => {
  let data = { title: 'JARVIS', body: '', url: '/jarvis' };
  try { if (event.data) data = { ...data, ...event.data.json() }; }
  catch { if (event.data) data.body = event.data.text(); }
  event.waitUntil(
    self.registration.showNotification(data.title || 'JARVIS', {
      body: data.body || '',
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: data.url || '/jarvis' },
      vibrate: [200, 100, 200],
      tag: 'jarvis',
      renotify: true,
    }),
  );
});

// Tapping a notification focuses/opens the JARVIS cockpit.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/jarvis';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) { if (c.url.includes('/jarvis') && 'focus' in c) return c.focus(); }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
