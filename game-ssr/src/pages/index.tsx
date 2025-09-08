import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    // Проверяем авторизацию
    const user = localStorage.getItem('user');
    if (user) {
      router.replace('/simple-rooms');
    } else {
      router.replace('/simple-auth');
    }
  }, [router]);
  return null;
}

