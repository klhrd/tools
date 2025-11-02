// sw.js 內容

self.addEventListener('push', function(event) {
    console.log('[Service Worker] 收到推播通知！開始嘗試顯示通知。');

    // 嘗試解析資料。如果解析失敗或資料不存在，使用預設值
    let data;
    try {
        data = event.data ? event.data.json() : {};
    } catch (e) {
        // 如果 event.data 存在但不是 JSON 格式，會在這裡被捕獲
        console.error('解析推播資料失敗:', e);
        data = {}; 
    }

    const title = data.title || 'PWA 測試通知';
    const options = {
        body: data.body || '這是一個從 Service Worker 發送的訊息。',
        // 建議您暫時移除 icon 和 badge 選項，直到您確認它們的路徑在 GitHub Pages 上是可訪問的（以排除路徑問題）。
        // icon: '/icon-192.png', 
        // badge: '/badge-72.png'
    };
    
    // 必須使用 event.waitUntil 來保證通知顯示
    const notificationPromise = self.registration.showNotification(title, options)
        .catch(error => {
            // 捕獲 showNotification 執行時可能發生的錯誤
            console.error('showNotification 執行失敗:', error);
        });

    event.waitUntil(notificationPromise);
});

// 處理通知點擊事件 (可選)
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] 通知被點擊');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
