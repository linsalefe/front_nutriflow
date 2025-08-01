import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [form, setForm] = useState({ nome: '', objetivo: '', username: '' });
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/user/me');
        setForm({
          nome: res.data.nome,
          objetivo: res.data.objetivo,
          username: res.data.username,
        });
      } catch {
        setSnackbar({ open: true, message: 'Erro ao carregar dados.', severity: 'error' });
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/user/me', form);
      setSnackbar({ open: true, message: 'Dados atualizados!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao atualizar dados.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSenha = async () => {
    if (!senha) return;
    setLoading(true);
    try {
      await api.put('/user/password', { password: senha });
      setSnackbar({ open: true, message: 'Senha alterada!', severity: 'success' });
      setSenha('');
    } catch {
      setSnackbar({ open: true, message: 'Erro ao alterar senha.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'auto', sm: 'calc(100vh - 64px)' },
        overflow: 'auto',
        p: { xs: 2, sm: 3 },
        bgcolor: 'grey.100',
      }}
    >
      <Grid container spacing={3}>
        {/* FORMULÁRIO */}
        <Grid item xs={12} md={6}>
          <Paper
            elevation={4}
            sx={{
              p: 4,
              borderRadius: 4,
              bgcolor: 'background.paper',
              height: { xs: 'auto', md: '100%' },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                Dados do Usuário
              </Typography>
              <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth />
              <TextField label="E-mail" name="username" value={form.username} onChange={handleChange} disabled fullWidth />
              <TextField label="Objetivo" name="objetivo" value={form.objetivo} onChange={handleChange} fullWidth />
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
                sx={{ borderRadius: 2, py: 1.5, mt: 1 }}
              >
                Salvar Alterações
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Alterar Senha
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField
                  label="Nova Senha"
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  color="warning"
                  disabled={loading || !senha}
                  onClick={handleSenha}
                  sx={{ borderRadius: 2, py: 1.5 }}
                >
                  Salvar Senha
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* PAINEL DE DICAS (oculto no mobile) */}
        <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dicas Rápidas
            </Typography>
            <List dense>
              <ListItem>
                <ListItemIcon>
                  <RestaurantIcon color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary="Variedade de cores no prato"
                  secondary="Inclua legumes e frutas coloridas para mais nutrientes."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WaterDropIcon color="info" />
                </ListItemIcon>
                <ListItemText
                  primary="Hidrate-se!"
                  secondary="Pelo menos 2L de água por dia mantém seu organismo em equilíbrio."
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="warning" />
                </ListItemIcon>
                <ListItemText
                  primary="Use senhas seguras"
                  secondary="Mantenha seus dados protegidos usando senhas fortes."
                />
              </ListItem>
            </List>
            <Box sx={{ mt: 4 }}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Estatísticas Rápidas
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Você fez 5 perguntas esta semana. 👏
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Média de calorias analisadas: 450 kcal.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
