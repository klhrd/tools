// sw.js 內容 (硬編碼測試版本)

self.addEventListener('push', function(event) {
    console.log('[Service Worker] 收到推播通知！執行硬編碼測試。');

    // 硬編碼 Title 和 Options，以確保內容非空
    const title = '🎉 成功了！PWA 測試通知';
    const options = {
        body: '這是一個硬編碼的通知內容。如果能看到它，表示推播功能已成功。',
        // 移除 icon 和 badge，確保沒有路徑問題
    };

    // 必須使用 event.waitUntil 來保證通知顯示
    event.waitUntil(
        self.registration.showNotification(title, options)
            .catch(error => {
                // 如果 showNotification 失敗，會將錯誤輸出到 Service Worker Console
                console.error('showNotification 執行失敗:', error);
            })
    );
});

// 處理通知點擊事件 (可選)
self.addEventListener('notificationclick', function(event) {
    console.log('[Service Worker] 通知被點擊');
    event.notification.close();
    event.waitUntil(
        clients.openWindow('/')
    );
});
