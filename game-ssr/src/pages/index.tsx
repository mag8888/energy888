import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/1game');
  }, [router]);
  return null;
}

