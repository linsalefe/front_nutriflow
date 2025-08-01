// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
// import axios from 'axios'; // Removido
import App from './App';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from './theme/theme';
import { ThemeModeProvider, useThemeMode } from './contexts/ThemeModeContext';
import { LoadingProvider } from './contexts/LoadingContext';

// Fontes
import '@fontsource/poppins/300.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

// Reset básico
import './index.css';

// Removido axios.defaults.baseURL

function ThemedApp() {
  const { mode } = useThemeMode();
  return (
    <ThemeProvider theme={getTheme(mode as 'light' | 'dark')}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeModeProvider>
    <LoadingProvider>
      <ThemedApp />
    </LoadingProvider>
  </ThemeModeProvider>
);
