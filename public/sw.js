// Minimal service worker — just enough to make the site installable as an app.
// It doesn't cache anything aggressively, so your admin panel always loads fresh data.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Always go to the network first; this handler's presence is what
  // makes browsers consider the site "installable".
  event.respondWith(fetch(event.request));
});
