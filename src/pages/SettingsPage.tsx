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
import { motion } from 'framer-motion';
import SecurityIcon from '@mui/icons-material/Security';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';

// Tema por horário
const getThemeByTime = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) {
    return { primary: '#4fc3f7', secondary: '#81c784', background: 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)', name: 'morning' };
  } else if (hour >= 12 && hour < 18) {
    return { primary: '#66bb6a', secondary: '#4caf50', background: 'linear-gradient(135deg, #f5f7f5 0%, #ffffff 100%)', name: 'afternoon' };
  }
  return { primary: '#ff8a65', secondary: '#ffb74d', background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)', name: 'evening' };
};

const LINA_AVATAR = '/lina-avatar.png';

export default function SettingsPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [themeColors, setThemeColors] = useState(getThemeByTime());
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

  // Atualiza tema
  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    const interval = setInterval(updateTheme, 60000);
    return () => clearInterval(interval);
  }, []);

  // Carrega usuário
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
      const { data } = await api.post('/user/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      setForm({ ...form, restrictions: [...form.restrictions, e.currentTarget.value.trim()] });
      e.currentTarget.value = '';
      e.preventDefault();
    }
  };

  const handleRemoveRestriction = (item: string) =>
    setForm({ ...form, restrictions: form.restrictions.filter((r: string) => r !== item) });

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: themeColors.background,
        // safe-areas e respiro no mobile
        pt: { xs: 'calc(env(safe-area-inset-top, 0px) + 8px)', md: 2 },
        pb: { xs: 'calc(env(safe-area-inset-bottom, 0px) + 16px)', md: 2 },
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          mx: 'auto',
          px: { xs: 1.25, sm: 2, md: 4 },
          backgroundColor: 'rgba(255,255,255,0.86)',
          backdropFilter: 'blur(8px)',
          minHeight: { xs: 'calc(100vh - 24px)', md: 'calc(100vh - 32px)' },
          borderRadius: { xs: 2, md: 4 },
          boxShadow: { xs: '0 2px 8px rgba(0,0,0,0.08)', md: '0 0 32px rgba(0,0,0,0.06)' },
        }}
      >
        {/* Cabeçalho */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ textAlign: 'center', py: { xs: 1.5, md: 4 } }}>
            <Avatar
              src={LINA_AVATAR}
              alt="Lina"
              sx={{
                width: { xs: 48, sm: 60 },
                height: { xs: 48, sm: 60 },
                mx: 'auto',
                mb: 1.5,
                boxShadow: `0 8px 32px ${themeColors.primary}40`,
                border: '3px solid #fff',
                bgcolor: themeColors.primary,
              }}
            />
            <Typography
              variant={isMobile ? 'h6' : 'h4'}
              sx={{
                fontWeight: 700,
                mb: 0.5,
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
              }}
            >
              Configurações
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', fontSize: { xs: '0.9rem', sm: '1rem' }, maxWidth: 600, mx: 'auto', lineHeight: 1.6 }}
            >
              Personalize seu perfil e configure suas preferências nutricionais
            </Typography>
          </Box>
        </motion.div>

        <Grid container spacing={{ xs: 2, md: 3 }}>
          {/* FORMULÁRIO PRINCIPAL */}
          <Grid item xs={12} lg={8}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 1.25, sm: 2, md: 4 },
                  borderRadius: 4,
                  background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  border: '1px solid rgba(0,0,0,0.06)',
                  boxShadow: `0 8px 32px ${themeColors.primary}10`,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Seção Avatar e Dados Básicos */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <PersonIcon sx={{ color: themeColors.primary, fontSize: 24 }} />
                  <Typography variant="subtitle1" fontWeight={700} color={themeColors.primary}>
                    Perfil do Usuário
                  </Typography>
                </Box>

                <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar
                    src={avatarUrl}
                    sx={{
                      width: { xs: 72, sm: 96 },
                      height: { xs: 72, sm: 96 },
                      boxShadow: `0 8px 24px ${themeColors.primary}30`,
                      border: '4px solid #fff',
                    }}
                  >
                    {!avatarUrl && (form.nome?.[0]?.toUpperCase() || form.username?.[0]?.toUpperCase() || 'U')}
                  </Avatar>
                  <Button
                    variant="outlined"
                    component="label"
                    disabled={loading}
                    fullWidth={isMobile}
                    size={isMobile ? 'small' : 'medium'}
                    sx={{
                      textTransform: 'none',
                      borderColor: themeColors.primary,
                      color: themeColors.primary,
                      fontSize: { xs: '0.9rem', sm: '0.95rem' },
                      px: { xs: 2, sm: 3 },
                      '&:hover': { backgroundColor: `${themeColors.primary}10`, borderColor: themeColors.secondary },
                    }}
                  >
                    Trocar foto de perfil
                    <input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={(e) => e.target.files && handleAvatar(e.target.files[0])} />
                  </Button>
                </Stack>

                <Box component="form" onSubmit={handleSave} sx={{ display: 'grid', gap: 2.5 }}>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Nome completo"
                        name="nome"
                        value={form.nome}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.primary },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: themeColors.secondary },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="E-mail" name="username" value={form.username} disabled fullWidth size={isMobile ? 'small' : 'medium'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                        <InputLabel>Sexo</InputLabel>
                        <Select name="sex" value={form.sex} onChange={(e) => setForm({ ...form, sex: e.target.value })}>
                          <MenuItem value="M">Masculino</MenuItem>
                          <MenuItem value="F">Feminino</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Idade" name="age" type="number" value={form.age} onChange={handleChange} fullWidth size={isMobile ? 'small' : 'medium'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Altura (cm)" name="height_cm" type="number" value={form.height_cm} onChange={handleChange} fullWidth size={isMobile ? 'small' : 'medium'} />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField label="Peso atual (kg)" name="current_weight" type="number" value={form.current_weight} onChange={handleChange} fullWidth size={isMobile ? 'small' : 'medium'} />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
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
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth size={isMobile ? 'small' : 'medium'}>
                        <InputLabel>Objetivo</InputLabel>
                        <Select name="goal_type" value={form.goal_type} onChange={(e) => setForm({ ...form, goal_type: e.target.value })}>
                          <MenuItem value="lose">🔥 Perder gordura</MenuItem>
                          <MenuItem value="gain">💪 Ganhar massa</MenuItem>
                          <MenuItem value="maintain">⚖️ Manter peso</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Velocidade (kg/semana)"
                        name="pace_kg_per_week"
                        type="number"
                        value={form.pace_kg_per_week}
                        onChange={handleChange}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        inputProps={{ step: 0.1, min: 0.1, max: 1.0 }}
                      />
                    </Grid>
                  </Grid>

                  {/* Restrições Alimentares */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color={themeColors.primary} mb={1.5}>
                      🚫 Restrições Alimentares
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
                      {form.restrictions.map((r: string) => (
                        <Chip
                          key={r}
                          label={r}
                          onDelete={() => handleRemoveRestriction(r)}
                          size="small"
                          sx={{ bgcolor: `${themeColors.secondary}15`, color: themeColors.secondary, '& .MuiChip-deleteIcon': { color: themeColors.secondary } }}
                        />
                      ))}
                    </Box>
                    <TextField
                      placeholder="Digite uma restrição e pressione Enter (ex: lactose, glúten)"
                      onKeyDown={handleAddRestriction}
                      fullWidth
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.confirm_low_calorie}
                        onChange={(e) => setForm({ ...form, confirm_low_calorie: e.target.checked })}
                        size="small"
                        sx={{ color: themeColors.primary, '&.Mui-checked': { color: themeColors.secondary } }}
                      />
                    }
                    label={<Typography variant="body2">Confirmo dieta de baixa caloria, se necessário</Typography>}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    fullWidth={isMobile}
                    size={isMobile ? 'medium' : 'large'}
                    sx={{
                      py: { xs: 1.1, sm: 1.5 },
                      fontSize: { xs: '1rem', sm: '1.1rem' },
                      fontWeight: 600,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                      boxShadow: `0 8px 24px ${themeColors.primary}35`,
                      textTransform: 'none',
                      '&:hover': {
                        background: `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`,
                        boxShadow: `0 12px 32px ${themeColors.primary}45`,
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    💾 Salvar Alterações
                  </Button>
                </Box>

                <Divider sx={{ my: 3, opacity: 0.3 }} />

                {/* Seção Alterar Senha */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <LockIcon sx={{ color: themeColors.primary, fontSize: 24 }} />
                    <Typography variant="subtitle1" fontWeight={700} color={themeColors.primary}>
                      Segurança da Conta
                    </Typography>
                  </Box>

                  <Grid container spacing={{ xs: 1.5, sm: 2 }} alignItems="end">
                    <Grid item xs={12} sm={8}>
                      <TextField
                        label="Nova senha"
                        type="password"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        fullWidth
                        size={isMobile ? 'small' : 'medium'}
                        placeholder="Mínimo 6 caracteres"
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button
                        variant="outlined"
                        disabled={loading || !senha}
                        onClick={handleSenha}
                        fullWidth
                        size={isMobile ? 'medium' : 'large'}
                        sx={{
                          py: { xs: 1.1, sm: 1.6 },
                          borderColor: '#f44336',
                          color: '#f44336',
                          fontSize: { xs: '0.9rem', sm: '0.95rem' },
                          textTransform: 'none',
                          '&:hover': { backgroundColor: '#f4433610', borderColor: '#d32f2f' },
                        }}
                      >
                        🔒 Alterar Senha
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </motion.div>
          </Grid>

          {/* Painel de Dicas — escondido no mobile */}
          <Grid item xs={12} lg={4} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}08)`,
                  border: `1px solid ${themeColors.primary}20`,
                  height: 'fit-content',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <TipsAndUpdatesIcon sx={{ color: themeColors.primary, fontSize: 28 }} />
                  <Typography variant="h6" fontWeight={600} color={themeColors.primary}>
                    Dicas Importantes
                  </Typography>
                </Box>

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <RestaurantIcon sx={{ color: themeColors.secondary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Variedade de cores no prato"
                      secondary="Inclua legumes e frutas coloridas para mais nutrientes."
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem', lineHeight: 1.4 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WaterDropIcon sx={{ color: themeColors.secondary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Hidratação adequada"
                      secondary="Pelo menos 35ml por kg de peso corporal."
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem', lineHeight: 1.4 }}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <SecurityIcon sx={{ color: themeColors.secondary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Mantenha dados seguros"
                      secondary="Use senhas fortes e únicas."
                      primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem', lineHeight: 1.4 }}
                    />
                  </ListItem>
                </List>

                <Box sx={{ mt: 3, p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    💡 Dica: Mantenha seus dados sempre atualizados para recomendações mais precisas da Lina!
                  </Typography>
                </Box>
              </Paper>
            </motion.div>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          sx={{ width: '100%', borderRadius: 2, boxShadow: `0 8px 24px ${snackbar.severity === 'success' ? themeColors.secondary : '#f44336'}30` }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
