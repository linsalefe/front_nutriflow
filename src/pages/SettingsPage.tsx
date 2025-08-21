// src/pages/SettingsPage.tsx
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
  Avatar,
  Stack,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import SecurityIcon from '@mui/icons-material/Security';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [form, setForm] = useState<any>({
    nome: '',
    objetivo: '',
    username: '',
    sex: '',
    age: '',
    height_cm: '',
    initial_weight: '',
    current_weight: '',
    activity_level: '',
    goal_type: '',
    pace_kg_per_week: '',
    restrictions: [] as string[],
    confirm_low_calorie: false,
  });

  const [senha, setSenha] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
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
        setForm((prev: any) => ({ ...prev, ...res.data }));
        setAvatarUrl(res.data.avatar_url);
      } catch {
        setSnackbar({ open: true, message: 'Erro ao carregar dados.', severity: 'error' });
      }
    })();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch('/user', form);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleAvatar = async (file: File) => {
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post('/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAvatarUrl(data.avatar_url);
      setSnackbar({ open: true, message: 'Foto atualizada!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Falha ao enviar avatar.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRestriction = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
      setForm({
        ...form,
        restrictions: [...form.restrictions, e.currentTarget.value.trim()],
      });
      e.currentTarget.value = '';
      e.preventDefault();
    }
  };

  const handleRemoveRestriction = (item: string) => {
    setForm({
      ...form,
      restrictions: form.restrictions.filter((r: string) => r !== item),
    });
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: 'auto', sm: 'calc(100vh - 64px)' },
        overflow: 'auto',
        p: { xs: 2, sm: 3 },
        bgcolor: 'grey.100',
        marginLeft: { xs: 0, md: '240px' },
      }}
    >
      <Grid container spacing={3}>
        {/* FORMULÁRIO + AVATAR */}
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
              gap: 3,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar src={avatarUrl} sx={{ width: 64, height: 64 }}>
                {!avatarUrl && (form.nome?.[0]?.toUpperCase() || form.username?.[0]?.toUpperCase() || 'U')}
              </Avatar>
              <Button variant="outlined" component="label" disabled={loading} sx={{ textTransform: 'none' }}>
                Trocar foto
                <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleAvatar(e.target.files[0])} />
              </Button>
            </Stack>

            <Box component="form" onSubmit={handleSave} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h5" fontWeight={700}>
                Dados do Usuário
              </Typography>
              <TextField label="Nome" name="nome" value={form.nome} onChange={handleChange} fullWidth />
              <TextField label="E-mail" name="username" value={form.username} disabled fullWidth />
              <TextField label="Objetivo" name="objetivo" value={form.objetivo} onChange={handleChange} fullWidth />

              <FormControl fullWidth>
                <InputLabel>Sexo</InputLabel>
                <Select name="sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Feminino</MenuItem>
                </Select>
              </FormControl>

              <TextField label="Idade" name="age" type="number" value={form.age} onChange={handleChange} fullWidth />
              <TextField label="Altura (cm)" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} fullWidth />
              <TextField label="Peso inicial" name="initial_weight" type="number" value={form.initial_weight} onChange={handleChange} fullWidth />
              <TextField label="Peso atual" name="current_weight" type="number" value={form.current_weight} onChange={handleChange} fullWidth />

              <FormControl fullWidth>
                <InputLabel>Nível de Atividade</InputLabel>
                <Select
                  name="activity_level"
                  value={form.activity_level}
                  onChange={(e) => setForm({ ...form, activity_level: Number(e.target.value) })}
                >
                  <MenuItem value={1.2}>1.2 - Sedentário</MenuItem>
                  <MenuItem value={1.375}>1.375 - Leve</MenuItem>
                  <MenuItem value={1.55}>1.55 - Moderado</MenuItem>
                  <MenuItem value={1.725}>1.725 - Intenso</MenuItem>
                  <MenuItem value={1.9}>1.9 - Muito intenso</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Objetivo</InputLabel>
                <Select
                  name="goal_type"
                  value={form.goal_type}
                  onChange={(e) => setForm({ ...form, goal_type: e.target.value })}
                >
                  <MenuItem value="lose">Perder gordura</MenuItem>
                  <MenuItem value="gain">Ganhar massa</MenuItem>
                  <MenuItem value="maintain">Manter peso</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Velocidade (kg/semana)"
                name="pace_kg_per_week"
                type="number"
                value={form.pace_kg_per_week}
                onChange={handleChange}
                fullWidth
              />

              <Box>
                <Typography variant="subtitle1">Restrições alimentares</Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                  {form.restrictions.map((r: string) => (
                    <Chip key={r} label={r} onDelete={() => handleRemoveRestriction(r)} />
                  ))}
                </Box>
                <TextField placeholder="Digite e pressione Enter" onKeyDown={handleAddRestriction} fullWidth sx={{ mt: 1 }} />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={form.confirm_low_calorie}
                    onChange={(e) => setForm({ ...form, confirm_low_calorie: e.target.checked })}
                  />
                }
                label="Confirmo que aceito uma dieta de baixa caloria, se necessário"
              />

              <Button type="submit" variant="contained" color="success" disabled={loading} sx={{ borderRadius: 2, py: 1.5, mt: 1 }}>
                Salvar Alterações
              </Button>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Alterar Senha
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                <TextField label="Nova Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} fullWidth />
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

        {/* PAINEL DE DICAS (desktop only) */}
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
                <ListItemText primary="Variedade de cores no prato" secondary="Inclua legumes e frutas coloridas para mais nutrientes." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <WaterDropIcon color="info" />
                </ListItemIcon>
                <ListItemText primary="Hidrate-se!" secondary="Pelo menos 2L de água por dia mantém seu organismo em equilíbrio." />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SecurityIcon color="warning" />
                </ListItemIcon>
                <ListItemText primary="Use senhas seguras" secondary="Mantenha seus dados protegidos usando senhas fortes." />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

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
