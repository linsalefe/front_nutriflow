// src/components/PrivateRoute.tsx
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api, { getToken, setToken } from '../services/api';

type Props = { children: React.ReactElement };

export default function PrivateRoute({ children }: Props) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'login' | 'pay'>('checking');
  const location = useLocation();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus('login');
      return;
    }

    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        const { data } = await api.get('/user/me', { signal: controller.signal });
        if (!mounted) return;

        localStorage.setItem('me', JSON.stringify(data));
        const userHasAccess = Boolean((data as any)?.is_admin || (data as any)?.has_access);
        setStatus(userHasAccess ? 'allowed' : 'pay');
      } catch (err: any) {
        if (!mounted) return;
        // ignorar cancelamentos
        if (err?.name === 'CanceledError' || err?.code === 'ERR_CANCELED') return;
        if (err?.response?.status === 401) setToken(null);
        setStatus('login');
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [location.pathname]);

  if (status === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'login') return <Navigate to="/login" replace state={{ from: location }} />;
  if (status === 'pay')   return <Navigate to="/pagamento" replace state={{ from: location }} />;

  return children;
}
