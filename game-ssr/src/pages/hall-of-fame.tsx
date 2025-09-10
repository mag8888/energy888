import { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import Head from 'next/head';
import Link from 'next/link';

interface HallOfFamePlayer {
  _id: string;
  name: string;
  email: string;
  totalWins: number;
  totalMoney: number;
  totalGames: number;
  bestScore: number;
  createdAt: string;
  updatedAt: string;
}

export default function HallOfFame() {
  const { socket, isConnected } = useSocket();
  const [players, setPlayers] = useState<HallOfFamePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleHallOfFameList = (data: HallOfFamePlayer[]) => {
      console.log('🏆 Получен Зал Славы:', data);
      setPlayers(data);
      setLoading(false);
    };

    const handleError = (error: any) => {
      console.error('❌ Ошибка Зала Славы:', error);
      setError(error.message || 'Ошибка загрузки Зала Славы');
      setLoading(false);
    };

    // Подписываемся на события
    socket.on('hall-of-fame-list', handleHallOfFameList);
    socket.on('error', handleError);

    // Запрашиваем Зал Славы
    socket.emit('get-hall-of-fame');

    // Cleanup
    return () => {
      socket.off('hall-of-fame-list', handleHallOfFameList);
      socket.off('error', handleError);
    };
  }, [socket, isConnected]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>🏆</div>
          <div>Загрузка Зала Славы...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>❌</div>
          <div>{error}</div>
          <Link href="/simple-rooms" style={{
            display: 'inline-block',
            marginTop: '20px',
            padding: '10px 20px',
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '5px'
          }}>
            Вернуться в лобби
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Зал Славы - Energy of Money</title>
        <meta name="description" content="Рейтинг лучших игроков Energy of Money" />
      </Head>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          color: 'white'
        }}>
          {/* Заголовок */}
          <div style={{
            textAlign: 'center',
            marginBottom: '30px'
          }}>
            <h1 style={{
              fontSize: '36px',
              margin: '0 0 10px 0',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              🏆 Зал Славы
            </h1>
            <p style={{
              fontSize: '18px',
              opacity: 0.9,
              margin: '0 0 20px 0'
            }}>
              Лучшие игроки Energy of Money
            </p>
            <Link href="/simple-rooms" style={{
              display: 'inline-block',
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '25px',
              border: '1px solid rgba(255,255,255,0.3)',
              transition: 'all 0.3s ease'
            }}>
              ← Вернуться в лобби
            </Link>
          </div>

          {/* Список игроков */}
          {players.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '20px' }}>🏆</div>
              <div style={{ fontSize: '18px', opacity: 0.8 }}>
                Зал Славы пуст. Станьте первым чемпионом!
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '15px'
            }}>
              {players.map((player, index) => (
                <div
                  key={player._id}
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    padding: '20px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  {/* Место и имя */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </div>
                    <div>
                      <div style={{
                        fontSize: '18px',
                        fontWeight: 'bold',
                        marginBottom: '5px'
                      }}>
                        {player.name}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        opacity: 0.8
                      }}>
                        {player.email}
                      </div>
                    </div>
                  </div>

                  {/* Статистика */}
                  <div style={{
                    display: 'flex',
                    gap: '30px',
                    textAlign: 'center'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#4CAF50'
                      }}>
                        {player.totalWins}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8
                      }}>
                        Побед
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#FFC107'
                      }}>
                        ${player.totalMoney.toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8
                      }}>
                        Деньги
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#2196F3'
                      }}>
                        {player.totalGames}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8
                      }}>
                        Игр
                      </div>
                    </div>
                    <div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#E91E63'
                      }}>
                        ${player.bestScore.toLocaleString()}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        opacity: 0.8
                      }}>
                        Лучший счет
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Информация о рейтинге */}
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
              📊 Как формируется рейтинг?
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '15px',
              fontSize: '14px',
              opacity: 0.9
            }}>
              <div>
                <strong>🥇 Победители</strong><br/>
                Количество выигранных игр
              </div>
              <div>
                <strong>💰 Деньги</strong><br/>
                Общая сумма заработанных денег
              </div>
              <div>
                <strong>🎮 Игры</strong><br/>
                Общее количество сыгранных игр
              </div>
              <div>
                <strong>⭐ Лучший счет</strong><br/>
                Максимальный счет в одной игре
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
