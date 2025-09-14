// Быстрое исправление для Railway
// Этот скрипт можно выполнить в консоли браузера

// Очищаем localStorage от неправильных URL
if (localStorage.getItem('SOCKET_URL') && localStorage.getItem('SOCKET_URL').includes('localhost')) {
    localStorage.removeItem('SOCKET_URL');
    console.log('✅ Очищен localStorage от localhost URL');
}

// Устанавливаем правильный URL
localStorage.setItem('SOCKET_URL', 'https://money8888-production.up.railway.app');
console.log('✅ Установлен правильный Socket URL:', localStorage.getItem('SOCKET_URL'));

// Перезагружаем страницу
console.log('🔄 Перезагружаем страницу...');
window.location.reload();

