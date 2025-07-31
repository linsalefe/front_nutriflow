import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
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

// Aponta todas as chamadas axios para o backend
axios.defaults.baseURL = 'http://localhost:8000';

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
