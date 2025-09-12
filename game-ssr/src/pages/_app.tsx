import type { AppProps } from 'next/app';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { SocketProvider, useSocket } from '../contexts/SocketContext';
import DebugRoomsPanel from '../components/DebugRoomsPanel';
import '../styles/globals.css';

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

// Create custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#667eea',
      light: '#8fa4f3',
      dark: '#4c63d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2',
      light: '#9c7bb8',
      dark: '#5a3a7a',
      contrastText: '#ffffff',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#ffffff',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3B82F6',
      light: '#60A5FA',
      dark: '#2563EB',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F9FAFB',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '8px 16px',
          boxShadow: '0 4px 14px 0 rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SocketProvider>
        <Head>
          <title>Energy of Money - Игра на финансовую грамотность</title>
          <meta name="description" content="Играйте и изучайте основы финансовой грамотности" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="theme-color" content="#667eea" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <meta name="apple-mobile-web-app-title" content="Energy of Money" />
        </Head>
        <Component {...pageProps} />
        <DebugInfo />
        <DebugRoomsPanel />
      </SocketProvider>
    </ThemeProvider>
  );
}