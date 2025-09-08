import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Перенаправляем на простую авторизацию
    router.replace('/simple-auth');
  }, [router]);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>
          Energy of Money
        </h1>
        <p>Перенаправление...</p>
      </div>
    </div>
  );
}
