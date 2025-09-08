import * as React from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { CssBaseline, ThemeProvider, createTheme, Box } from '@mui/material';
import { AuthProvider } from '@/lib/auth';
import FooterBar from '@/ui/FooterBar';

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
        <title>Energy of Money — 1game</title>
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
