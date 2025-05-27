// 通知許可のリクエスト
function requestNotificationPermission() {
  if (Notification.permission !== 'granted') {
    Notification.requestPermission().then(permission => {
      if (permission !== 'granted') {
        alert('通知が許可されていません');
      }
    });
  }
}

// 指定時間に通知を表示
function scheduleNotification(title, body, time) {
  const now = new Date();
  const delay = time.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(() => {
      new Notification(title, {
        body: body,
        icon: './images/icon.jpg'
      });
    }, delay);
  }
}
