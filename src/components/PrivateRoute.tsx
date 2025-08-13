// src/routes/PrivateRoute.tsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api, { getToken, setToken } from '../services/api';

type Props = { children: JSX.Element };

export default function PrivateRoute({ children }: Props) {
  const [status, setStatus] = useState<'checking' | 'allowed' | 'login' | 'pay'>('checking');
  const location = useLocation();

  useEffect(() => {
    const token = getToken();

    // Sem token → não chama /me
    if (!token) {
      setStatus('login');
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const { data } = await api.get('/user/me');
        localStorage.setItem('me', JSON.stringify(data));

        const userHasAccess = Boolean(data?.is_admin || data?.has_access);
        if (!mounted) return;
        setStatus(userHasAccess ? 'allowed' : 'pay');
      } catch (err: any) {
        if (err?.response?.status === 401) setToken(null);
        if (!mounted) return;
        setStatus('login');
      }
    })();

    return () => { mounted = false; };
  }, [location.pathname]);

  if (status === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'login') {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (status === 'pay') {
    return <Navigate to="/pagamento" replace state={{ from: location }} />;
  }

  return children;
}
