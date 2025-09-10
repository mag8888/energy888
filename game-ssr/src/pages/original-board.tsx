import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

// Импортируем полный компонент игровой доски
// import OriginalGameBoardFull from '../components/OriginalGameBoardFull';

export default function OriginalBoardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Симуляция загрузки
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '20px',
          padding: '40px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            🔄 Загрузка полной игровой доски...
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem'
          }}>
            Подготавливаем 24 внутренних + 52 внешних клетки
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '20px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div>
            <h1 style={{
              color: 'white',
              margin: 0,
              fontSize: '2rem',
              fontWeight: 'bold'
            }}>
              🎮 Полная игровая доска
            </h1>
            <div style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: '1rem',
              marginTop: '5px'
            }}>
              24 внутренних клетки + 52 внешних клетки = 76 клеток
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => router.push('/game-board')}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(45deg, #2196F3, #1976D2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              🎯 Простая доска
            </button>
            <button
              onClick={() => router.push('/simple-rooms')}
              style={{
                padding: '10px 20px',
                background: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              🏠 В лобби
            </button>
          </div>
        </div>

        {/* Информация о доске */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '30px',
          marginBottom: '30px',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <h2 style={{ color: 'white', marginTop: 0, marginBottom: '20px' }}>
            📋 Описание полной игровой доски
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            <div>
              <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>
                🔵 Внутренний круг (24 клетки)
              </h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.6' }}>
                <li>🎯 Возможности (малые/большие сделки)</li>
                <li>🛍️ Всякая всячина (обязательные траты)</li>
                <li>❤️ Благотворительность</li>
                <li>💰 PayDay (зарплата)</li>
                <li>🏪 Рынок (покупатели активов)</li>
                <li>👶 Ребенок (увеличение расходов)</li>
                <li>🎲 Шанс (случайные события)</li>
                <li>💸 Налоги</li>
                <li>🏠 Недвижимость</li>
                <li>📈 Акции</li>
                <li>💼 Бизнес</li>
                <li>🎓 Образование</li>
              </ul>
            </div>
            
            <div>
              <h3 style={{ color: '#FF9800', marginBottom: '15px' }}>
                🔲 Внешний квадрат (52 клетки)
              </h3>
              <ul style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.6' }}>
                <li>🏠 Недвижимость (разные типы)</li>
                <li>📈 Акции (различные компании)</li>
                <li>💼 Бизнес (разные отрасли)</li>
                <li>🎯 Возможности</li>
                <li>🛍️ Расходы</li>
                <li>🎲 Шанс</li>
                <li>💸 Налоги</li>
                <li>🏦 Банк</li>
                <li>👮 Тюрьма</li>
                <li>🅿️ Парковка</li>
                <li>🚀 Старт</li>
                <li>🏁 Финиш</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Заглушка для полной доски */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(15px)',
          borderRadius: '15px',
          padding: '40px',
          textAlign: 'center',
          border: '2px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.5rem',
            marginBottom: '20px'
          }}>
            🚧 Полная игровая доска в разработке
          </div>
          <div style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '1rem',
            marginBottom: '30px'
          }}>
            Компонент OriginalGameBoard.js найден и будет интегрирован
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              background: 'rgba(76, 175, 80, 0.2)',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(76, 175, 80, 0.3)'
            }}>
              <div style={{ color: '#4CAF50', fontSize: '2rem', marginBottom: '10px' }}>🔵</div>
              <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px' }}>Внутренний круг</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>24 клетки</div>
            </div>
            
            <div style={{
              background: 'rgba(255, 152, 0, 0.2)',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 152, 0, 0.3)'
            }}>
              <div style={{ color: '#FF9800', fontSize: '2rem', marginBottom: '10px' }}>🔲</div>
              <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px' }}>Внешний квадрат</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>52 клетки</div>
            </div>
            
            <div style={{
              background: 'rgba(156, 39, 176, 0.2)',
              padding: '20px',
              borderRadius: '10px',
              border: '1px solid rgba(156, 39, 176, 0.3)'
            }}>
              <div style={{ color: '#9C27B0', fontSize: '2rem', marginBottom: '10px' }}>🎮</div>
              <div style={{ color: 'white', fontWeight: 'bold', marginBottom: '5px' }}>Всего клеток</div>
              <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '14px' }}>76 клеток</div>
            </div>
          </div>
          
          <button
            onClick={() => router.push('/game-board')}
            style={{
              padding: '15px 30px',
              background: 'linear-gradient(45deg, #9C27B0, #7B1FA2)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(156, 39, 176, 0.4)',
              transition: 'all 0.3s ease'
            }}
          >
            🎯 Перейти к простой доске
          </button>
        </div>
      </div>

      {/* Дебаг-панель */}
      <DebugRoomsPanel />
    </div>
  );
}
