const enableButton = document.getElementById('enable-notifications');
const statusElement = document.getElementById('status');

// 1. 檢查瀏覽器是否支援 Service Worker 和 Notifications
if ('serviceWorker' in navigator && 'Notification' in window) {
    // 註冊 Service Worker
    // 嘗試使用相對路徑
    navigator.serviceWorker.register('./sw.js') 
    // 或者，如果您的 PWA 部署在子目錄下，但 Service Worker 放在根目錄，請確保 scope 正確。
        .then(registration => {
            console.log('Service Worker 註冊成功:', registration);
            statusElement.textContent = 'Service Worker 已註冊。';
        })
        .catch(error => {
            console.error('Service Worker 註冊失敗:', error);
            statusElement.textContent = 'Service Worker 註冊失敗。';
        });

    // 點擊按鈕後請求通知權限
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

} else {
    statusElement.textContent = '您的瀏覽器不支援 Service Worker 或 Notifications API。';
}
