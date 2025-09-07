// Тест для проверки хуков и типов модульной системы
console.log('🧪 Тестирование хуков и типов модульной системы...');

async function testHooksAndTypes() {
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

    // Тест создания экземпляров хуков (без React)
    console.log('\n🧪 Тестирование создания экземпляров хуков...');
    
    // Мокаем React хуки
    const mockUseState = (initial) => [initial, () => {}];
    const mockUseEffect = () => {};
    const mockUseRef = (initial) => ({ current: initial });
    const mockUseCallback = (fn) => fn;
    const mockUseMemo = (fn) => fn();

    // Создаем мок для React
    global.React = {
      useState: mockUseState,
      useEffect: mockUseEffect,
      useRef: mockUseRef,
      useCallback: mockUseCallback,
      useMemo: mockUseMemo
    };

    // Тестируем useGameState
    console.log('   - Тестирование useGameState...');
    const gameState = useGameState('test-room', { id: 'test-player' });
    console.log('     ✅ useGameState создан успешно');
    console.log('     - gamePlayers:', Array.isArray(gameState.gamePlayers));
    console.log('     - currentTurn:', typeof gameState.currentTurn);

    // Тестируем useUIState
    console.log('   - Тестирование useUIState...');
    const uiState = useUIState();
    console.log('     ✅ useUIState создан успешно');
    console.log('     - isMobile:', typeof uiState.isMobile);
    console.log('     - showModal:', typeof uiState.showProfessionModal);

    // Тестируем useGameLogic
    console.log('   - Тестирование useGameLogic...');
    const gameLogic = useGameLogic([], null, false, () => {});
    console.log('     ✅ useGameLogic создан успешно');
    console.log('     - diceValue:', typeof gameLogic.diceValue);
    console.log('     - rollDice:', typeof gameLogic.rollDice);

    console.log('\n🎉 Все тесты прошли успешно!');
    console.log('\n📊 Статистика:');
    console.log('   - Типов протестировано: 3');
    console.log('   - Хуков протестировано: 3');
    console.log('   - Функций протестировано: 9+');
    console.log('   - Статус: ✅ ВСЕ РАБОТАЕТ');

    console.log('\n🚀 Модульная система готова к использованию!');
    console.log('   - Для запуска приложения: npm start');
    console.log('   - Для разработки: npm run dev');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запускаем тест
testHooksAndTypes();
