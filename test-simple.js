// Простой тест для проверки модульной системы без React
console.log('🧪 Тестирование модульной системы...');

async function testModules() {
  try {
    // Тест импорта типов
    console.log('📋 Тестирование импорта типов...');
    const { GAME_STATES, PLAYER_STATES, CELL_TYPES } = await import('./modules/game-board/types/index.js');
    console.log('✅ Типы успешно импортированы');
    console.log('   - GAME_STATES:', Object.keys(GAME_STATES));
    console.log('   - PLAYER_STATES:', Object.keys(PLAYER_STATES));
    console.log('   - CELL_TYPES:', Object.keys(CELL_TYPES));

    // Тест импорта хуков
    console.log('\n🔧 Тестирование импорта хуков...');
    const { useGameState } = await import('./modules/game-board/hooks/useGameState.js');
    const { useUIState } = await import('./modules/game-board/hooks/useUIState.js');
    const { useGameLogic } = await import('./modules/game-board/hooks/useGameLogic.js');
    console.log('✅ Хуки успешно импортированы');
    console.log('   - useGameState:', typeof useGameState);
    console.log('   - useUIState:', typeof useUIState);
    console.log('   - useGameLogic:', typeof useGameLogic);

    // Тест импорта модуля
    console.log('\n📦 Тестирование импорта модуля...');
    const gameBoardModule = await import('./modules/game-board/index.js');
    console.log('✅ Модуль игровой доски успешно импортирован');
    console.log('   - Экспорты:', Object.keys(gameBoardModule));

    // Тест импорта главного модуля
    console.log('\n🏠 Тестирование импорта главного модуля...');
    const mainModule = await import('./modules/index.js');
    console.log('✅ Главный модуль успешно импортирован');
    console.log('   - Экспорты:', Object.keys(mainModule));

    console.log('\n🎉 Все тесты прошли успешно!');
    console.log('\n📊 Статистика:');
    console.log('   - Модулей создано: 1');
    console.log('   - Хуков создано: 3');
    console.log('   - Типов создано: 3');
    console.log('   - Компонентов создано: 1');

    console.log('\n🚀 Для запуска приложения используйте:');
    console.log('   npm start');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запускаем тест
testModules();
