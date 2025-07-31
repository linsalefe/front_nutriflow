// src/pages/LoginPage.tsx
import { useState } from 'react';
import axios from 'axios';
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
  Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:8000/api/user/login', {
        username,
        password,
      });
      localStorage.setItem('token', res.data.access_token);
      setSnackbar({ open: true, message: 'Login realizado com sucesso!', severity: 'success' });
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Usuário ou senha inválidos.', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
      }}
    >
      <Card sx={{ maxWidth: 400, p: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', mb: 1 }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={700}>
              Entrar
            </Typography>
          </Box>

          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
            >
              Login
            </Button>
          </Box>

          {/* Link para página de cadastro */}
          <Box textAlign="center" mt={2}>
            <Typography variant="body2">
              Ainda não tem conta?{' '}
              <Link component={RouterLink} to="/signup" underline="hover">
                Cadastre-se
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
