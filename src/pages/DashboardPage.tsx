import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HeightIcon from '@mui/icons-material/Height';
import FlagIcon from '@mui/icons-material/Flag';
import ScaleIcon from '@mui/icons-material/Scale';

import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import ProgressCard from '../components/ProgressCard';

interface LogItem {
  date: string;
  weight: number;
}

interface DashboardMetrics {
  objective?: string;
  height_cm?: number;
  initial_weight?: number;
  current_weight?: number;
  weight_lost?: number;
  bmi?: number;
  history: LogItem[];
}

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  const [userName, setUserName] = useState<string>('Usuário');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newHeight, setNewHeight] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Extrai nome do JWT
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserName(payload.nome || payload.username || 'Usuário');
      } catch {}
    }
  }, []);

  // Busca métricas
  const fetchMetrics = async (p: string) => {
    setLoadingAction(true);
    try {
      // Remove '/api' pois já é baseURL
      const url = `/dashboard/metrics${p ? `?period=${p}` : ''}`;
      const { data } = await api.get<DashboardMetrics>(url);
      setMetrics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };
  useEffect(() => {
    fetchMetrics(period);
  }, [period]);

  // Handlers do modal
  const handleOpenDialog = () => {
    setNewWeight('');
    setNewHeight('');
    setDialogOpen(true);
  };
  const handleCloseDialog = () => setDialogOpen(false);
  const handleConfirm = async () => {
    const weight = parseFloat(newWeight.replace(',', '.'));
    const height = parseFloat(newHeight.replace(',', '.'));
    if (isNaN(weight) || weight <= 0 || isNaN(height) || height <= 0) return;

    setLoadingAction(true);
    try {
      // 1) Atualiza altura no perfil
      await api.patch('/user', { height_cm: height });
      // 2) Registra novo peso
      await api.post('/weight-logs', { weight });
      setDialogOpen(false);
      fetchMetrics(period);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // Loading inicial
  if (!metrics) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 'calc(100vh - 64px)',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const history = metrics.history || [];

  // IMC e classificação
  const bmiValue = metrics.bmi ?? 0;
  const classification =
    bmiValue < 18.5
      ? 'Abaixo do peso'
      : bmiValue < 25
      ? 'Peso normal'
      : bmiValue < 30
      ? 'Sobrepeso'
      : 'Obesidade';

  // Empty state
  if (history.length === 0 && !loadingAction) {
    return (
      <Box sx={{ px: isMobile ? 2 : 6, py: isMobile ? 3 : 6 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Olá, {userName} 👋
        </Typography>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Dashboard
        </Typography>
        <Box textAlign="center" py={6}>
          <Typography variant="body1" color="text.secondary">
            Você ainda não registrou nenhum peso.
          </Typography>
          <Button variant="contained" onClick={handleOpenDialog} sx={{ mt: 2 }}>
            Registrar Peso e Altura
          </Button>
        </Box>

        {/* Modal */}
        <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="xs">
          <DialogTitle>Registrar Peso e Altura</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Peso (kg)"
              fullWidth
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              helperText="Use ponto ou vírgula"
            />
            <TextField
              margin="dense"
              label="Altura (cm)"
              fullWidth
              value={newHeight}
              onChange={(e) => setNewHeight(e.target.value)}
              helperText="Ex.: 170"
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={loadingAction}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={loadingAction} variant="contained">
              {loadingAction ? <CircularProgress size={20} /> : 'Ok'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Layout principal
  return (
    <Box sx={{ px: isMobile ? 2 : 6, py: isMobile ? 3 : 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          Olá, {userName} 👋
        </Typography>
        <Button variant="contained" onClick={handleOpenDialog}>
          Registrar Peso/Altura
        </Button>
      </Box>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item>
          <StatsCard
            icon={<FitnessCenterIcon />}
            label="Objetivo"
            value={metrics.objective || '-'}
            highlight
          />
        </Grid>
        <Grid item>
          <StatsCard
            icon={<HeightIcon />}
            label="Altura"
            value={`${metrics.height_cm ?? '-'} cm`}
          />
        </Grid>
        <Grid item>
          <StatsCard
            icon={<FlagIcon />}
            label="Peso Inicial"
            value={`${metrics.initial_weight ?? '-'} kg`}
          />
        </Grid>
        <Grid item>
          <StatsCard
            icon={<ScaleIcon />}
            label="Peso Atual"
            value={`${metrics.current_weight ?? '-'} kg`}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <ChartCard
            data={history}
            activePeriod={period}
            onChangePeriod={setPeriod}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <ProgressCard
            initialWeight={metrics.initial_weight}
            currentWeight={metrics.current_weight}
            weightLost={metrics.weight_lost}
            bmi={metrics.bmi}
          />
          <Typography variant="subtitle1" mt={2} align="center">
            {classification}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
