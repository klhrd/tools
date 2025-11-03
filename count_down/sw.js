const CACHE_NAME = 'countdown-pwa-v1.3.2'; // *** v1.3.2 修正 ***
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
        console.log('Opened cache and caching core files (v1.3.2)');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) 
  );
});

// 2. Fetch 事件：從快取提供資源 (Cache First)
self.addEventListener('fetch', event => {
  // v1.3.2 修正: 對於預設集 JSON，永遠嘗試從網路獲取 (Network First)
  // (註: v1.3.2 的 index.html 已使用 cache: 'no-cache'，此處為雙重保險)
  if (event.request.url.includes('assets/default_data/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request); // 網路失敗時才使用快取
      })
    );
    return;
  }
  
  // 其他所有請求 (App 核心) 使用 Cache First
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
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
    }).then(() => self.clients.claim()) 
  );
});

// --- v1.3.2 修正 Bug 2: 新增通知點擊監聽器 ---
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked!');
  event.notification.close(); // 關閉通知

  // 尋找並聚焦到已開啟的 App 視窗，如果沒有則開啟新視窗
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(clientList => {
      // 檢查是否有已開啟的視窗
      for (let i = 0; i < clientList.length; i++) {
        let client = clientList[i];
        // 如果視窗可見 (非最小化) 且 'focus' 方法存在
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // 如果找不到，開啟新視窗
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});
