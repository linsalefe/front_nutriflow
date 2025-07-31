import { useEffect, useState } from 'react';
import axios from 'axios';
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Carrega dados do usuário
  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/user/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  // Atualiza perfil
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:8000/api/user/me', form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSnackbar({ open: true, message: 'Dados atualizados!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao atualizar dados.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Atualiza senha
  const handleSenha = async () => {
    if (!senha) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        'http://localhost:8000/api/user/password',
        { password: senha },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSnackbar({ open: true, message: 'Senha alterada!', severity: 'success' });
      setSenha('');
    } catch {
      setSnackbar({ open: true, message: 'Erro ao alterar senha.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Atualiza campos de formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', overflow: 'auto', p: 3, bgcolor: 'grey.100' }}>
      <Grid container spacing={3}>
        {/* FORMULÁRIO */}
        <Grid item xs={12} md={6}>
          <Paper elevation={4} sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Dados do Usuário
            </Typography>
            <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                label="Nome"
                name="nome"
                value={form.nome}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
              <TextField
                label="E-mail"
                name="username"
                value={form.username}
                onChange={handleChange}
                disabled
                fullWidth
                variant="outlined"
              />
              <TextField
                label="Objetivo"
                name="objetivo"
                value={form.objetivo}
                onChange={handleChange}
                fullWidth
                variant="outlined"
              />
              <Button
                type="submit"
                variant="contained"
                color="success"
                disabled={loading}
                sx={{ mt: 2, borderRadius: 2, py: 1.5 }}
              >
                Salvar Alterações
              </Button>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" fontWeight={600} gutterBottom>
              Alterar Senha
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                label="Nova Senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                fullWidth={!isMobile}
                variant="outlined"
              />
              <Button
                variant="contained"
                color="warning"
                disabled={loading || !senha}
                onClick={handleSenha}
                sx={{ borderRadius: 2, px: 5, py: 1.5, mt: isMobile ? 2 : 0 }}
              >
                Salvar Senha
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* PAINEL DE DICAS */}
        <Grid item xs={12} md={6}>
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

            {/* Exemplo de gráfico ou estatística */}
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
        <Alert severity={snackbar.severity as any} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
