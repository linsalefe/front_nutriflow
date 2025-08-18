// src/components/PrivateRoute.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api, { getToken, setToken } from '../services/api';

type Props = { children: React.ReactElement };
type Status = 'checking' | 'allowed' | 'login' | 'pay';

export default function PrivateRoute({ children }: Props) {
  const [status, setStatus] = useState<Status>('checking');
  const location = useLocation();
  const fetchedRef = useRef(false);

  const isLogin = location.pathname.startsWith('/login');
  const isPayment = location.pathname.startsWith('/pagamento');

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const token = getToken();
    if (!token) {
      setStatus('login');
      return;
    }

    let alive = true;
    (async () => {
      try {
        const { data } = await api.get('/user/me', { headers: { 'Cache-Control': 'no-store' } });
        if (!alive) return;
        localStorage.setItem('me', JSON.stringify(data || {}));
        const userHasAccess = Boolean((data as any)?.is_admin || (data as any)?.has_access);
        setStatus(userHasAccess ? 'allowed' : 'pay');
      } catch (err: any) {
        if (!alive) return;
        if (err?.response?.status === 401) setToken(null);
        setStatus('login');
      }
    })();

    return () => { alive = false; };
  }, []);

  if (status === 'checking') {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'allowed') return children;

  if (status === 'pay') {
    return isPayment ? children : <Navigate to="/pagamento" replace state={{ from: location }} />;
  }

  // status === 'login'
  return isLogin ? children : <Navigate to="/login" replace state={{ from: location }} />;
}
