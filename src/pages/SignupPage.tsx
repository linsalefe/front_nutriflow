import { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, TextField, Button, Box, Avatar, Snackbar, Alert } from '@mui/material';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    nome: '',
    objetivo: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/api/user/signup', form);
      setSnackbar({ open: true, message: 'Cadastro realizado com sucesso!', severity: 'success' });
      setTimeout(() => navigate('/login'), 1500); // Redireciona para login
    } catch (err: any) {
      setSnackbar({ open: true, message: 'Erro ao cadastrar usuário.', severity: 'error' });
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default' }}>
      <Card sx={{ maxWidth: 400, p: 4, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mb: 1 }}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography component="h1" variant="h5" fontWeight={700}>
              Criar Conta
            </Typography>
          </Box>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="E-mail"
              name="username"
              value={form.username}
              onChange={handleChange}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Senha"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Nome"
              name="nome"
              value={form.nome}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Objetivo"
              name="objetivo"
              value={form.objetivo}
              onChange={handleChange}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="secondary"
              sx={{ mt: 2, py: 1.5 }}
            >
              Cadastrar
            </Button>
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
