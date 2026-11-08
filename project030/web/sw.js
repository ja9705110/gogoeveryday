// PROJECT 030 service worker：離線外殼快取 + 推播
const CACHE = 'p030-v17';
const SHELL = ['./', 'index.html', 'css/app.css', 'js/app.js', 'js/api.js', 'js/config.js', 'js/steps.js', 'js/scene.js', 'js/sample.js', 'js/glyphs.js', 'js/ar.js', 'js/prologue.js', 'js/audio.js', 'js/bg.js', 'js/planet.js', 'js/ceremony.js', 'js/portrait-map.js', 'js/mosaic.js', 'vendor/supabase.js', 'icons/icon-192.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  // 網路優先：遊戲狀態一律以伺服器為準，快取只在離線時提供外殼
  // 每次都向伺服器確認是否有新版（no-cache 會用 ETag 驗證，沒變就很快），避免看到舊版
  const fresh = e.request.mode === 'navigate' ? fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' }) : fetch(e.request, { cache: 'no-cache' });
  e.respondWith(fresh.then((r) => { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); return r; }).catch(() => caches.match(e.request)));
});
self.addEventListener('push', (e) => {
  let d = {};
  try { d = e.data.json(); } catch (_) { d = { title: 'PROJECT 030', body: e.data && e.data.text() }; }
  e.waitUntil(self.registration.showNotification(d.title || 'PROJECT 030', {
    body: d.body || '', tag: d.tag || 'p030', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './index.html#/inbox' },
  }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = new URL(e.notification.data.url, self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    const c = cs.find((x) => x.url.startsWith(self.registration.scope));
    return c ? c.navigate(target).then((w) => w && w.focus()) : self.clients.openWindow(target);
  }));
});
