// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api, { getToken } from '../services/api';

type Status = 'checking' | 'allowed' | 'login';

function useAuthGuard(): Status {
  const [status, setStatus] = useState<Status>('checking');

  useEffect(() => {
    const token = typeof getToken === 'function' ? getToken() : localStorage.getItem('nutriflow_token');
    if (!token) {
      setStatus('login');
      return;
    }
    let alive = true;
    (async () => {
      try {
        await api.get('/user/me');
        if (alive) setStatus('allowed');
      } catch {
        // token inválido/expirado
        try {
          localStorage.removeItem('nutriflow_token');
          localStorage.removeItem('me');
        } catch {}
        if (alive) setStatus('login');
      }
    })();
    return () => { alive = false; };
  }, []);

  return status;
}

// ✅ Versão compatível com `<PrivateRoute>{children}</PrivateRoute>`
type Props = { children: React.ReactElement };

export default function PrivateRoute({ children }: Props) {
  const status = useAuthGuard();

  if (status === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'login') return <Navigate to="/login" replace />;

  return children;
}

// ✅ Alternativa para rotas aninhadas: use `<Route element={<PrivateOutlet/>}>`
export function PrivateOutlet() {
  const status = useAuthGuard();

  if (status === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'login') return <Navigate to="/login" replace />;

  return <Outlet />;
}
