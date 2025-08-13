// src/components/ErrorBoundary.tsx
import React from 'react';
import { Box, Button, Alert, Typography } from '@mui/material';

type Props = { children: React.ReactNode };
type State = { hasError: boolean; error?: any };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, info: any) {
    console.error('ErrorBoundary capturou:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
          <Box sx={{ maxWidth: 520 }}>
            <Alert severity="error" variant="filled" sx={{ mb: 2 }}>
              <Typography variant="h6" sx={{ mb: 1 }}>Ops! Algo deu errado.</Typography>
              <Typography variant="body2">Tente recarregar a página. Se persistir, faça login novamente.</Typography>
            </Alert>
            <Button onClick={() => window.location.reload()} variant="contained">
              Recarregar
            </Button>
          </Box>
        </Box>
      );
    }
    return this.props.children as any;
  }
}
