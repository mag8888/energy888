import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

export default function IndexPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (user) {
      router.replace('/simple-rooms');
    } else {
      setLoading(false);
    }
  }, [router]);

  const handlePlayClick = () => {
    router.push('/simple-auth');
  };

  if (loading) {
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
          color: 'white',
          fontSize: '1.5rem',
          textAlign: 'center'
        }}>
          🔄 Загрузка...
        </div>
      </div>
    );
  }

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
        padding: '60px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        border: '2px solid rgba(255, 255, 255, 0.3)',
        textAlign: 'center',
        maxWidth: '600px',
        width: '90%'
      }}>
        <h1 style={{
          color: 'white',
          fontSize: '3rem',
          marginBottom: '20px',
          fontWeight: 'bold',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Energy of Money
        </h1>
        
        <p style={{
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: '1.2rem',
          marginBottom: '40px',
          lineHeight: '1.6'
        }}>
          🎮 Управляйте деньгами, инвестируйте и достигайте своих целей!<br/>
          💰 Создавайте комнаты, играйте с друзьями и побеждайте!
        </p>

        <button
          onClick={handlePlayClick}
          style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            padding: '20px 40px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '1.5rem',
            boxShadow: '0 8px 25px rgba(255, 107, 107, 0.4)',
            transition: 'all 0.3s ease',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(255, 107, 107, 0.6)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 107, 107, 0.4)';
          }}
        >
          🎯 Играть
        </button>

        <div style={{
          marginTop: '30px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '0.9rem'
        }}>
          Для начала игры необходимо авторизоваться
        </div>
      </div>
      
      {/* Дебаг-панель */}
      <DebugRoomsPanel />
    </div>
  );
}

