var CACHE_NAME = 'NTUT-VisionCraft-Caches-v1';
var urlsToCache = [
  './',                // index.html
  './index.html',
  './manifest.json',
  './images/icon.jpg',
//  './main.js',         // もしJSファイルがあるなら
//  './style.css'        // もしCSSがあるなら
];

// インストール処理
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );
});

// リソースフェッチ時のキャッシュロード処理
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      // キャッシュがあれば返す、なければネットワークから取得
      return response || fetch(event.request).catch(() => {
        // ネットもダメなら何かしら返す（例: offline.html用意とか）
        return new Response('オフライン中です', {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
      });
    })
  );
});
