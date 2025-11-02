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
    
    // 3. 實作本地通知測試 (透過 Service Worker 代理)
    testButton.addEventListener('click', () => {
        if (Notification.permission === 'granted') {
            const title = '本地按鈕透過 Service Worker 發送';
            const body = '這是最可靠的網頁通知方式！';
            
            // 檢查 Service Worker 是否已註冊且就緒
            navigator.serviceWorker.ready.then(registration => {
                // 使用 Service Worker 的 showNotification()
                // 由於這是從主執行緒發起的，我們用 showNotification() 而不是 push 事件
                registration.showNotification(title, {
                    body: body,
                })
                .then(() => {
                    console.log('通知請求已成功傳遞給 Service Worker 執行。');
                })
                .catch(error => {
                    console.error('Service Worker showNotification 執行失敗:', error);
                });
            });
    
        } else {
            alert('請先點擊「啟用通知」按鈕並允許權限。');
        }
    });

} else {
    statusElement.textContent = '您的瀏覽器不支援 Service Worker 或 Notifications API。';
}
