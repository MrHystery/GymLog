const V = 'gymlog-v1';
const ASSETS = ['./', './index.html', './style.css', './app.js', './exercises.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))));
  self.clients.claim();
});
// Cache d'abord (fonctionne hors-ligne), mise à jour en arrière-plan
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(caches.match(e.request).then(cached => {
    const net = fetch(e.request).then(res => { const cp = res.clone(); caches.open(V).then(c => c.put(e.request, cp)); return res; }).catch(() => cached);
    return cached || net;
  }));
});
