import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function TestRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState('');

  useEffect(() => {
    // Получаем ID комнаты из URL параметров
    const { id } = router.query;
    if (id) {
      setRoomId(id as string);
    }
  }, [router.query]);

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
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        maxWidth: '500px'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '2rem',
          marginBottom: '20px'
        }}>
          🧪 Тестовая страница комнаты
        </h1>
        
        <div style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          marginBottom: '30px'
        }}>
          ID комнаты: {roomId || 'Загрузка...'}
        </div>

        <button
          onClick={() => router.push('/simple-rooms')}
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '15px 30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '16px',
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          Вернуться в лобби
        </button>
      </div>
    </div>
  );
}
