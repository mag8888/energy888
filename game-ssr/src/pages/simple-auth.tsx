import { useState } from 'react';
import { useRouter } from 'next/router';

export default function SimpleAuth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Простая авторизация
        localStorage.setItem('user', JSON.stringify({
          email: formData.email,
          name: formData.email.split('@')[0]
        }));
        setMessage('Авторизация успешна!');
        setTimeout(() => {
          router.push('/rooms');
        }, 1500);
      } else {
        // Простая регистрация
        localStorage.setItem('user', JSON.stringify({
          name: formData.name,
          email: formData.email
        }));
        setMessage('Регистрация успешна!');
        setTimeout(() => {
          router.push('/rooms');
        }, 1500);
      }
    } catch (error) {
      setMessage('Ошибка: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{
          color: 'white',
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '2rem',
          fontWeight: 'bold'
        }}>
          Energy of Money
        </h1>

        <div style={{
          display: 'flex',
          marginBottom: '30px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '10px',
          padding: '5px'
        }}>
          <button
            onClick={() => setIsLogin(true)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: isLogin ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Вход
          </button>
          <button
            onClick={() => setIsLogin(false)}
            style={{
              flex: 1,
              padding: '10px',
              border: 'none',
              borderRadius: '8px',
              background: !isLogin ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
              color: 'white',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Регистрация
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px' }}>
              <input
                type="text"
                placeholder="Имя"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required={!isLogin}
                style={{
                  width: '100%',
                  padding: '15px',
                  border: 'none',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  fontSize: '16px',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <input
              type="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              border: 'none',
              borderRadius: '10px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        {message && (
          <div style={{
            marginTop: '20px',
            padding: '10px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        <div style={{
          marginTop: '30px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '14px'
        }}>
          <p>Telegram Bot: <a href="https://t.me/energy_m_bot" style={{color: 'white'}}>@energy_m_bot</a></p>
        </div>
      </div>
    </div>
  );
}
