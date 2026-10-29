/* ZamHelper service worker. Deliberately conservative:
   - static assets (CSS, JS, icons, Leaflet) are cached for speed and weak connections;
   - pages are ALWAYS fetched from the network (never cached), so signed-in content is never stored on a shared phone;
   - if the network is down, a friendly offline page is shown;
   - /api/, /auth/, /admin/, /payments/ and every non-GET request bypass the cache entirely. */
const VERSION = 'zamhelper-v1';
const PRECACHE = ['offline.html', 'assets/style.css', 'assets/ui-settings.js', 'assets/zam-map.js', 'assets/book.js', 'assets/favicon.png',
  'assets/zamhelper-badge-96.png', 'assets/zamhelper-badge.webp', 'assets/icon-192.png', 'assets/vendor/leaflet/leaflet.css', 'assets/vendor/leaflet/leaflet.js'];
const NEVER_CACHE = /\/(api|auth|admin|payments|uploads)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => Promise.all(PRECACHE.map(u => c.add(u).catch(() => null)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || NEVER_CACHE.test(url.pathname)) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('offline.html')));
    return;
  }
  if (/\.(css|js|png|webp|svg|woff2?)$/.test(url.pathname)) {           // stale-while-revalidate for static assets
    e.respondWith(caches.open(VERSION).then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
  }
});
