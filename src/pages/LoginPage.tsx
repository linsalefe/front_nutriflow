// src/pages/LoginPage.tsx
import React, { useState } from 'react';
import api, { loginJson } from '../services/api';
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Avatar,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!username || !password) {
      setSnackbar({ open: true, message: 'Preencha usuário e senha.', severity: 'error' });
      return;
    }
    setLoading(true);
    try {
      // 🔐 Login via JSON (POST /user/login)
      await loginJson(username.trim(), password);

      // valida token com /me
      const { data: me } = await api.get('/user/me');
      localStorage.setItem('me', JSON.stringify(me));

      setSnackbar({ open: true, message: 'Login realizado com sucesso!', severity: 'success' });
      // 🎯 Navega para a página de boas-vindas
      setTimeout(() => navigate('/', { replace: true }), 600);
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.message || 'Erro ao fazer login';
      setSnackbar({ open: true, message: String(msg), severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 420, p: 4, borderRadius: 3, boxShadow: 6 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={700}>
              Entrar
            </Typography>
          </Box>

          <Box component="form" sx={{ mt: 1, display: 'grid', gap: 2 }} onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              label="Usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              autoComplete="username"
            />
            <TextField
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1.5, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={22} /> : 'Login'}
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Ainda não tem conta?{' '}
              <Button component="a" href="/signup" sx={{ textTransform: 'none', p: 0, minWidth: 0 }}>
                Cadastre-se
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2500}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
