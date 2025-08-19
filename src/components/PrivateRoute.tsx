// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';

type Props = { children: React.ReactElement };

export default function PrivateRoute({ children }: Props) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Verificação simples de token
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  // Aguardando verificação
  if (isAuthenticated === null) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Não autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Autenticado
  return children;
}
