const CACHE_NAME = 'cobalt-client-v1';
const ASSETS = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// アプリ本体はキャッシュから即返す。cobaltインスタンスへのAPI通信はそのままネットワークへ通す。
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const isSameOrigin = url.origin === self.location.origin;
  if (!isSameOrigin) return; // 他ドメイン(cobaltインスタンス)への通信はキャッシュしない

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
