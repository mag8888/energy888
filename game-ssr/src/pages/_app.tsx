import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { SocketProvider, useSocket } from '../contexts/SocketContext';
import DebugRoomsPanel from '../components/DebugRoomsPanel';

function DebugInfo() {
  const { socketUrl, isConnected } = useSocket();
  const [debugInfo, setDebugInfo] = useState<{ socketUrl: string; envUrl?: string; host: string; time: string } | null>(null);
  
  // Версия приложения
  const APP_VERSION = 'v2.1.3-ad4f113';

  useEffect(() => {
    try {
      const envUrl = process.env.NEXT_PUBLIC_SOCKET_URL;
      // Игнорируем localhost URL из переменной окружения
      const validEnvUrl = envUrl && !envUrl.includes('localhost') ? envUrl : undefined;
      const qp = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const qpUrl = qp?.get('socket') || undefined;
      const lsUrl = typeof window !== 'undefined' ? (localStorage.getItem('SOCKET_URL') || undefined) : undefined;
      const resolvedUrl = qpUrl || lsUrl || validEnvUrl || 'https://botenergy-7to1-production.up.railway.app';
      
      setDebugInfo({
        socketUrl: resolvedUrl,
        envUrl,
        host: typeof window !== 'undefined' ? window.location.host : 'ssr',
        time: new Date().toLocaleTimeString()
      });
      // eslint-disable-next-line no-console
      console.log('💡 DEBUG: Socket URL resolved to:', resolvedUrl, { envUrl, qpUrl, lsUrl });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('DEBUG banner init error', e);
    }
  }, []);

  if (!debugInfo) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 8,
      left: 8,
      zIndex: 99999,
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      padding: '6px 10px',
      border: '1px solid rgba(255,255,255,0.3)',
      borderRadius: 6,
      fontSize: 12,
      lineHeight: 1.2,
      backdropFilter: 'blur(6px)'
    }}>
      <div>Version: {APP_VERSION}</div>
      <div>ENV: {process.env.NODE_ENV || 'development'}</div>
      <div>Host: {debugInfo.host}</div>
      <div>Socket: {debugInfo.socketUrl}</div>
      <div>EnvVar: {debugInfo.envUrl || 'undefined'}</div>
      <div>Connected: {isConnected ? '✅' : '❌'}</div>
      <div>t: {debugInfo.time}</div>
      <div style={{ opacity: 0.7, marginTop: 4 }}>Override: ?socket=URL or localStorage.SOCKET_URL</div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {

  return (
    <SocketProvider>
      <Head>
        <title>Energy of Money</title>
        <meta name="description" content="Energy of Money Game" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <DebugInfo />
      <Component {...pageProps} />
      <DebugRoomsPanel />
    </SocketProvider>
  );
}