// Простой тест для проверки модульной системы
import React from 'react';

async function testModules() {
  // Тест импорта модулей
  console.log('🧪 Тестирование импорта модулей...');

  try {
    // Тест импорта главного модуля
    const { GameBoard } = await import('./modules/index.js');
    console.log('✅ Импорт GameBoard успешен');

    // Тест импорта хуков
    const { useGameState, useUIState, useGameLogic } = await import('./modules/index.js');
    console.log('✅ Импорт хуков успешен');

    // Тест импорта типов
    const { GAME_STATES, PLAYER_STATES, CELL_TYPES } = await import('./modules/index.js');
    console.log('✅ Импорт типов успешен');

    console.log('\n🎉 Все модули успешно импортированы!');
    console.log('\n📊 Статистика модулей:');
    console.log('- GameBoard: основной компонент игровой доски');
    console.log('- useGameState: управление состоянием игры');
    console.log('- useUIState: управление UI состоянием');
    console.log('- useGameLogic: игровая логика');
    console.log('- Типы: GAME_STATES, PLAYER_STATES, CELL_TYPES');

    // Тест создания экземпляра компонента
    console.log('\n🔧 Тестирование создания компонента...');

    const mockProps = {
      roomId: 'test-room',
      playerData: {
        id: 'test-player',
        username: 'Test User',
        socketId: 'test-socket'
      },
      onExit: () => console.log('Exit called')
    };

    // Проверяем, что компонент может быть создан
    const element = React.createElement(GameBoard, mockProps);
    console.log('✅ Компонент GameBoard успешно создан');

    console.log('\n✨ Тестирование завершено успешно!');
    console.log('\n🚀 Для запуска приложения используйте:');
    console.log('   npm start');
    console.log('   или');
    console.log('   node start.js');

  } catch (error) {
    console.error('❌ Ошибка при тестировании модулей:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запускаем тест
testModules();
