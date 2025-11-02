// 監聽 'push' 事件，這是後端/模擬推播發送時觸發的事件
self.addEventListener('push', function(event) {
    console.log('[Service Worker] 收到推播通知！');
    
    // 嘗試解析推播數據，如果沒有數據則使用預設
    const data = event.data ? event.data.json() : { title: '預設通知標題', body: '這是一個模擬推播訊息。' };

    const title = data.title;
    const options = {
        body: data.body,
        icon: '/icon-192.png', // 理想情況下，應該提供一個應用程式圖示
        badge: '/badge-72.png' // 可選，用於行動裝置的徽章
    };

    // 使用 event.waitUntil 確保通知在 Service Worker 終止前顯示
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// 可選：處理通知點擊事件
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] 通知被點擊', event.notification);
    event.notification.close(); // 關閉通知
    
    // 點擊後打開一個新視窗
    event.waitUntil(
        clients.openWindow('/')
    );
});
