// app.js
const enableButton = document.getElementById('enable-notifications');
const testButton = document.getElementById('test-local-notification'); // 獲取新按鈕
const statusElement = document.getElementById('status');

// 1. 註冊 Service Worker (保持不變)
if ('serviceWorker' in navigator && 'Notification' in window) {
    navigator.serviceWorker.register('/sw.js')
        .then(registration => {
            console.log('Service Worker 註冊成功:', registration);
            statusElement.textContent = 'Service Worker 已註冊。';
        })
        .catch(error => {
            console.error('Service Worker 註冊失敗:', error);
            statusElement.textContent = 'Service Worker 註冊失敗。';
        });

    // 2. 啟用通知權限 (保持不變)
    enableButton.addEventListener('click', () => {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                statusElement.textContent = '通知權限已獲得！';
                console.log('通知權限: 允許');
            } else {
                statusElement.textContent = '通知權限被拒絕。';
                console.log('通知權限: 拒絕或預設');
            }
        });
    });
    
    // 3. 實作本地通知測試
    testButton.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
            const title = '即時通知測試';
            const options = {
                body: '這是一個由網頁頁面直接發送的通知。',
                // 這裡可以選擇加上 icon
            };
            
            // 使用瀏覽器的 Notification API 直接彈出通知
            new Notification(title, options);
            console.log('即時通知已發送。');
        } else {
            alert('請先點擊「啟用通知」按鈕並允許權限。');
        }
    });

} else {
    statusElement.textContent = '您的瀏覽器不支援 Service Worker 或 Notifications API。';
}
