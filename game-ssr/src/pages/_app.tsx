import * as React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { AuthProvider } from '@/lib/auth';
import FooterBar from '@/ui/FooterBar';

// Обработка ошибок message port (расширения браузера)
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message && event.reason.message.includes('message port closed')) {
      console.warn('Message port error suppressed:', event.reason.message);
      event.preventDefault();
    }
  });
}

const theme = createTheme({
  palette: {
    mode: 'dark'
  },
  components: {
    MuiDialog: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableRestoreFocus: true,
      },
    },
    MuiModal: {
      defaultProps: {
        disableEnforceFocus: true,
        disableAutoFocus: true,
        disableRestoreFocus: true,
      },
    },
  },
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Energy of Money — 1game</title>
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Box minHeight="100vh" display="flex" flexDirection="column">
            <Box flex={1}>
              <Component {...pageProps} />
            </Box>
            <FooterBar />
          </Box>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
}
