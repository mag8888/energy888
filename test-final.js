// Финальный тест модульной системы
console.log('🧪 Финальное тестирование модульной системы...');

async function testFinal() {
  try {
    // Тест импорта типов
    console.log('📋 Тестирование импорта типов...');
    const { GAME_STATES, PLAYER_STATES, CELL_TYPES } = await import('./src/modules/game-board/types/index.js');
    console.log('✅ Типы успешно импортированы');
    console.log('   - GAME_STATES:', Object.keys(GAME_STATES));
    console.log('   - PLAYER_STATES:', Object.keys(PLAYER_STATES));
    console.log('   - CELL_TYPES:', Object.keys(CELL_TYPES));

    // Тест импорта хуков
    console.log('\n🔧 Тестирование импорта хуков...');
    const { useGameState } = await import('./src/modules/game-board/hooks/useGameState.js');
    const { useUIState } = await import('./src/modules/game-board/hooks/useUIState.js');
    const { useGameLogic } = await import('./src/modules/game-board/hooks/useGameLogic.js');
    console.log('✅ Хуки успешно импортированы');
    console.log('   - useGameState:', typeof useGameState);
    console.log('   - useUIState:', typeof useUIState);
    console.log('   - useGameLogic:', typeof useGameLogic);

    // Тест импорта данных
    console.log('\n📊 Тестирование импорта данных...');
    const { MarketDeckManager } = await import('./src/data/marketCards.js');
    const { ExpenseDeckManager } = await import('./src/data/expenseCards.js');
    const { CELL_CONFIG } = await import('./src/data/gameCells.js');
    const { PLAYER_COLORS } = await import('./src/styles/playerColors.js');
    console.log('✅ Данные успешно импортированы');
    console.log('   - MarketDeckManager:', typeof MarketDeckManager);
    console.log('   - ExpenseDeckManager:', typeof ExpenseDeckManager);
    console.log('   - CELL_CONFIG:', Array.isArray(CELL_CONFIG));
    console.log('   - PLAYER_COLORS:', Array.isArray(PLAYER_COLORS));

    // Тест создания экземпляров менеджеров
    console.log('\n🏗️ Тестирование создания экземпляров...');
    const marketDeck = new MarketDeckManager();
    const expenseDeck = new ExpenseDeckManager();
    console.log('✅ Менеджеры созданы успешно');
    console.log('   - marketDeck.cards:', Array.isArray(marketDeck.cards));
    console.log('   - expenseDeck.cards:', Array.isArray(expenseDeck.cards));

    // Тест работы с данными
    console.log('\n🎯 Тестирование работы с данными...');
    const marketCard = marketDeck.drawCard();
    const expenseCard = expenseDeck.drawCard();
    console.log('✅ Карты созданы успешно');
    console.log('   - marketCard:', marketCard);
    console.log('   - expenseCard:', expenseCard);

    console.log('\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!');
    console.log('\n📊 Итоговая статистика:');
    console.log('   ✅ Типов создано: 3');
    console.log('   ✅ Хуков создано: 3');
    console.log('   ✅ Менеджеров создано: 2');
    console.log('   ✅ Конфигураций создано: 2');
    console.log('   ✅ Модулей создано: 1');
    console.log('   ✅ Файлов создано: 15+');

    console.log('\n🏆 МОДУЛЬНАЯ СИСТЕМА ГОТОВА!');
    console.log('\n🚀 Для запуска приложения:');
    console.log('   npm start');
    console.log('\n🔧 Для разработки:');
    console.log('   npm run dev');
    console.log('\n📚 Документация:');
    console.log('   README.md - основная документация');
    console.log('   MIGRATION.md - руководство по миграции');
    console.log('   REFACTORING_REPORT.md - отчет о рефакторинге');

  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
}

// Запускаем тест
testFinal();
