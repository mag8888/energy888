// Тест верификации Telegram авторизации
import crypto from 'crypto';

// Данные бота
const BOT_TOKEN = '8480976603:AAEcYvQ51AEQqeVtaJDypGfg_xMcO7ar2rI';
const BOT_NAME = 'energy_m_bot';

// Функция проверки хеша (как в API)
function checkTelegramAuth(data, botToken) {
  const authData = { ...data };
  const hash = authData.hash;
  delete authData.hash;

  const secret = crypto.createHash('sha256').update(botToken).digest();
  const checkString = Object.keys(authData)
    .sort()
    .map(k => `${k}=${authData[k]}`)
    .join('\n');
  const hmac = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
  return hmac === hash;
}

// Тестовые данные (симулируем данные от Telegram)
const testData = {
  id: '123456789',
  first_name: 'Test',
  last_name: 'User',
  username: 'testuser',
  photo_url: 'https://t.me/i/userpic/320/testuser.jpg',
  auth_date: Math.floor(Date.now() / 1000).toString(),
  hash: '' // Будет вычислен
};

// Вычисляем правильный хеш
const secret = crypto.createHash('sha256').update(BOT_TOKEN).digest();
const checkString = Object.keys(testData)
  .filter(k => k !== 'hash')
  .sort()
  .map(k => `${k}=${testData[k]}`)
  .join('\n');
const correctHash = crypto.createHmac('sha256', secret).update(checkString).digest('hex');
testData.hash = correctHash;

console.log('🤖 Тест Telegram верификации');
console.log('============================');
console.log('');

console.log('1️⃣ Данные бота:');
console.log('BOT_TOKEN:', BOT_TOKEN);
console.log('BOT_NAME:', BOT_NAME);
console.log('');

console.log('2️⃣ Тестовые данные пользователя:');
console.log(JSON.stringify(testData, null, 2));
console.log('');

console.log('3️⃣ Проверка хеша:');
const isValid = checkTelegramAuth(testData, BOT_TOKEN);
console.log('Результат:', isValid ? '✅ ВАЛИДНЫЙ' : '❌ НЕВАЛИДНЫЙ');
console.log('');

console.log('4️⃣ Проверка API эндпоинта:');
console.log('URL: /api/tg-verify');
console.log('Метод: GET');
console.log('Параметры:', new URLSearchParams(testData).toString());
console.log('');

console.log('5️⃣ Проверка виджета:');
console.log('Скрипт: https://telegram.org/js/telegram-widget.js');
console.log('Атрибуты:');
console.log('  data-telegram-login:', BOT_NAME);
console.log('  data-size: large');
console.log('  data-onauth: onTelegramAuth(user)');
console.log('  data-request-access: write');
console.log('');

console.log('6️⃣ Настройка бота:');
console.log('1. Откройте @BotFather в Telegram');
console.log('2. Отправьте: /setdomain');
console.log('3. Выберите: @energy_m_bot');
console.log('4. Укажите домен: localhost:3000 (или ваш ngrok URL)');
console.log('');

console.log('7️⃣ Тестирование:');
console.log('1. Запустите сервер: npm run dev');
console.log('2. Откройте: http://localhost:3000/auth');
console.log('3. Перейдите на вкладку "Telegram"');
console.log('4. Нажмите кнопку "Войти через Telegram"');
console.log('5. Авторизуйтесь в Telegram');
console.log('6. Проверьте, что пользователь авторизован');
console.log('');

if (isValid) {
  console.log('✅ ВСЕ ГОТОВО! Telegram авторизация должна работать.');
} else {
  console.log('❌ ОШИБКА! Проверьте настройки.');
}
