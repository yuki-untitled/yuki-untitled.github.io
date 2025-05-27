const CACHE_NAME = 'lesson-scheduler-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './images/icon.jpg',
  './images/icon-192.png',
  './images/icon-512.png',
  'https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js'
];

// Service Workerのインストール
self.addEventListener('install', function(event) {
  console.log('Service Worker: Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        // インストール後すぐにアクティブ化
        return self.skipWaiting();
      })
  );
});

// Service Workerのアクティベーション
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Activate');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // 古いキャッシュを削除
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // すべてのクライアントを制御下に置く
      return self.clients.claim();
    })
  );
});

// リクエストの処理（キャッシュファーストストラテジー）
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // キャッシュから返す
        if (response) {
          return response;
        }

        // ネットワークから取得を試行
        return fetch(event.request).then(function(response) {
          // レスポンスが有効でない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをクローンしてキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(function() {
        // オフライン時のフォールバック
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
        
        // その他のリソースの場合
        return new Response(
          JSON.stringify({
            error: 'オフラインです',
            message: 'ネットワーク接続を確認してください'
          }), 
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 
              'Content-Type': 'application/json; charset=utf-8' 
            }
          }
        );
      })
  );
});

// バックグラウンド同期
self.addEventListener('sync', function(event) {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync');
    // バックグラウンドでの処理があればここに実装
  }
});

// プッシュ通知の処理（将来の拡張用）
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push received');
  
  const options = {
    body: event.data ? event.data.text() : '新しい通知があります',
    icon: './images/icon-192.png',
    badge: './images/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '確認',
        icon: './images/icon-192.png'
      },
      {
        action: 'close',
        title: '閉じる',
        icon: './images/icon-192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('授業スケジューラー', options)
  );
});

// 通知クリック時の処理
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Notification click received.');

  event.notification.close();

  if (event.action === 'explore') {
    // アプリを開く
    event.waitUntil(
      clients.openWindow('./')
    );
  } else if (event.action === 'close') {
    // 何もしない（通知を閉じるだけ）
  } else {
    // デフォルトアクション：アプリを開く
    event.waitUntil(
      clients.openWindow('./')
    );
  }
});