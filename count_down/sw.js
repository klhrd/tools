const CACHE_NAME = 'countdown-pwa-v1.3.0'; // 更新版本
const urlsToCache = [
  // 核心檔案 (使用相對路徑)
  './',
  './index.html',
  './css/style.css',
  './manifest.json',
  
  // 圖標
  './assets/icons/icon-72.png',
  './assets/icons/icon-96.png',
  './assets/icons/icon-128.png',
  './assets/icons/icon-144.png',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  
  // 預設集資料
  './assets/default_data/national_holidays.json',
  './assets/default_data/school_exams.json'
];

// 1. Install 事件：快取核心檔案
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache and caching core files (v1.3.0)');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // 強制新的 SW 立即啟動
  );
});

// 2. Fetch 事件：從快取提供資源 (Cache First)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 如果快取中有，直接返回
        if (response) {
          return response;
        }
        // f
        return fetch(event.request);
      }
    )
  );
});

// 3. Activate 事件：清除舊快取
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // 立即控制所有頁面
  );
});
