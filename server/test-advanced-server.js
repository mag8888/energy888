const fetch = require('node-fetch');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:4000';

async function testServer() {
  console.log('🧪 Тестирование Advanced Socket Server...\n');
  
  try {
    // Тест 1: Статус сервера
    console.log('1️⃣ Тестируем статус сервера...');
    const statusResponse = await fetch(`${SERVER_URL}/`);
    const statusData = await statusResponse.json();
    console.log('✅ Статус:', statusData.ok ? 'OK' : 'ERROR');
    console.log('📊 Данные:', JSON.stringify(statusData, null, 2));
    
    // Тест 2: Здоровье сервера
    console.log('\n2️⃣ Тестируем здоровье сервера...');
    const healthResponse = await fetch(`${SERVER_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Здоровье:', healthData.status);
    console.log('📊 Данные:', JSON.stringify(healthData, null, 2));
    
    // Тест 3: Статистика
    console.log('\n3️⃣ Тестируем статистику...');
    const statsResponse = await fetch(`${SERVER_URL}/stats`);
    const statsData = await statsResponse.json();
    console.log('✅ Статистика:', statsData.ok ? 'OK' : 'ERROR');
    console.log('📊 Данные:', JSON.stringify(statsData, null, 2));
    
    // Тест 4: Список комнат
    console.log('\n4️⃣ Тестируем список комнат...');
    const roomsResponse = await fetch(`${SERVER_URL}/rooms`);
    const roomsData = await roomsResponse.json();
    console.log('✅ Комнаты:', roomsData.ok ? 'OK' : 'ERROR');
    console.log('📊 Данные:', JSON.stringify(roomsData, null, 2));
    
    // Тест 5: Зал славы
    console.log('\n5️⃣ Тестируем зал славы...');
    const hallResponse = await fetch(`${SERVER_URL}/hall-of-fame`);
    const hallData = await hallResponse.json();
    console.log('✅ Зал славы:', hallData.ok ? 'OK' : 'ERROR');
    console.log('📊 Данные:', JSON.stringify(hallData, null, 2));
    
    // Тест 6: Создание токена
    console.log('\n6️⃣ Тестируем создание токена...');
    const tokenResponse = await fetch(`${SERVER_URL}/tg/new-token`);
    const tokenData = await tokenResponse.json();
    console.log('✅ Токен:', tokenData.ok ? 'OK' : 'ERROR');
    console.log('📊 Данные:', JSON.stringify(tokenData, null, 2));
    
    console.log('\n🎉 Все тесты завершены!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error.message);
  }
}

testServer();
