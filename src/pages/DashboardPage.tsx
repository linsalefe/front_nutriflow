// src/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
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
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HeightIcon from '@mui/icons-material/Height';
import FlagIcon from '@mui/icons-material/Flag';
import ScaleIcon from '@mui/icons-material/Scale';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

import api from '../services/api';
import StatsCard from '../components/StatsCard';
import ChartCard from '../components/ChartCard';
import ProgressCard from '../components/ProgressCard';

interface LogItem {
  id: string;
  weight: number;
  recorded_at: string; // ISO UTC
}

interface ChartLog {
  date: string; // usado pelo ChartCard
  weight: number;
}

interface DashboardMetrics {
  objective?: string;
  height_cm?: number;
  initial_weight?: number;
  current_weight?: number;
  weight_lost?: number;
  bmi?: number;
  history: ChartLog[];
}

const drawerWidth = 240;

const formatDateBR = (value: string | number | Date) => {
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

const isoToLocalInput = (iso: string) => {
  // retorna 'YYYY-MM-DDTHH:mm' para <input type="datetime-local">
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};

const localInputToIso = (localValue: string) => {
  // recebe 'YYYY-MM-DDTHH:mm' (local) e devolve ISO UTC
  if (!localValue) return undefined;
  const local = new Date(localValue);
  if (isNaN(local.getTime())) return undefined;
  return local.toISOString();
};

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [period, setPeriod] = useState<string>('30d');
  const [userName, setUserName] = useState<string>('Usuário');

  // dialog registrar
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newWeight, setNewWeight] = useState<string>('');
  const [newHeight, setNewHeight] = useState<string>('');
  const [loadingAction, setLoadingAction] = useState(false);

  // dialog histórico (listar/editar/apagar)
  const [historyOpen, setHistoryOpen] = useState(false);
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [errorLogs, setErrorLogs] = useState<string | null>(null);

  // editar item
  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<string>('');
  const [editWeight, setEditWeight] = useState<string>('');
  const [editDateLocal, setEditDateLocal] = useState<string>(''); // datetime-local

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/user/me');
        setUserName((data?.nome || data?.username || 'Usuário') as string);
      } catch {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserName(payload?.nome || payload?.username || 'Usuário');
          } catch {
            setUserName('Usuário');
          }
        }
      }
    })();
  }, []);

  const fetchMetrics = async (p: string) => {
    setLoadingAction(true);
    try {
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

  const fetchLogs = async () => {
    setLoadingLogs(true);
    setErrorLogs(null);
    try {
      const { data } = await api.get<LogItem[]>('/weight-logs'); // pega todos
      setLogs(data);
    } catch (e: any) {
      console.error(e);
      setErrorLogs('Não foi possível carregar o histórico.');
    } finally {
      setLoadingLogs(false);
    }
  };

  const openHistory = async () => {
    setHistoryOpen(true);
    await fetchLogs();
  };

  // Modal registrar
  const handleOpenDialog = () => {
    setNewWeight('');
    setNewHeight('');
    setDialogOpen(true);
  };
  const handleCloseDialog = () => setDialogOpen(false);

  const handleConfirm = async () => {
    const weight = parseFloat(newWeight.replace(',', '.'));
    if (isNaN(weight) || weight <= 0) return;

    const needsHeight = !metrics?.height_cm || metrics.height_cm <= 0;
    const heightValue =
      newHeight.trim() !== '' ? parseFloat(newHeight.replace(',', '.')) : undefined;

    if (needsHeight && (heightValue === undefined || isNaN(heightValue) || heightValue <= 0)) {
      return;
    }

    setLoadingAction(true);
    try {
      if (heightValue !== undefined) {
        await api.patch('/user', { height_cm: heightValue });
      }
      await api.post('/weight-logs', { weight });
      setDialogOpen(false);
      await fetchMetrics(period);
      if (historyOpen) await fetchLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  // editar
  const onClickEdit = (log: LogItem) => {
    setEditId(log.id);
    setEditWeight(String(log.weight).replace('.', ','));
    setEditDateLocal(isoToLocalInput(log.recorded_at));
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    const w = parseFloat(editWeight.replace(',', '.'));
    const dtIso = localInputToIso(editDateLocal);
    if ((isNaN(w) || w <= 0) && !dtIso) return;

    try {
      await api.patch(`/weight-logs/${editId}`, {
        ...(isNaN(w) || w <= 0 ? {} : { weight: w }),
        ...(dtIso ? { recorded_at: dtIso } : {}),
      });
      setEditOpen(false);
      await fetchMetrics(period);
      await fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // apagar
  const onDelete = async (id: string) => {
    if (!confirm('Remover este registro?')) return;
    try {
      await api.delete(`/weight-logs/${id}`);
      await fetchMetrics(period);
      await fetchLogs();
    } catch (e) {
      console.error(e);
    }
  };

  // Loading inicial
  if (!metrics) {
    return (
      <Box
        sx={{
          ml: isMobile ? 0 : `${drawerWidth}px`,
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

  const historyChart: ChartLog[] = useMemo(() => {
    const h = metrics.history || [];
    return h.map((item) => ({
      date: item.date, // já ISO
      weight: item.weight,
    }));
  }, [metrics]);

  const bmiValue = metrics.bmi ?? 0;
  const classification =
    bmiValue < 18.5
      ? 'Abaixo do peso'
      : bmiValue < 25
      ? 'Peso normal'
      : bmiValue < 30
      ? 'Sobrepeso'
      : 'Obesidade';

  const empty = (metrics.history || []).length === 0;

  return (
    <Box
      sx={{
        ml: isMobile ? 0 : `${drawerWidth}px`,
        px: isMobile ? 2 : 6,
        py: isMobile ? 3 : 6,
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} gap={1} flexWrap="wrap">
        <Typography variant="h5" fontWeight={600}>
          Olá, {userName} 👋
        </Typography>
        <Box display="flex" gap={1}>
          <Button variant="outlined" onClick={openHistory}>
            Histórico de Pesos
          </Button>
          <Button variant="contained" onClick={handleOpenDialog}>
            Registrar Peso/Altura
          </Button>
        </Box>
      </Box>

      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>

      {/* Cards + Gráfico */}
      <Grid container spacing={3}>
        <Grid item>
          <StatsCard icon={<FitnessCenterIcon />} label="Objetivo" value={metrics.objective || '-'} highlight />
        </Grid>
        <Grid item>
          <StatsCard icon={<HeightIcon />} label="Altura" value={`${metrics.height_cm ?? '-'} cm`} />
        </Grid>
        <Grid item>
          <StatsCard icon={<FlagIcon />} label="Peso Inicial" value={`${metrics.initial_weight ?? '-'} kg`} />
        </Grid>
        <Grid item>
          <StatsCard icon={<ScaleIcon />} label="Peso Atual" value={`${metrics.current_weight ?? '-'} kg`} />
        </Grid>

        <Grid item xs={12} md={8}>
          <ChartCard data={historyChart} activePeriod={period} onChangePeriod={setPeriod} />
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

      {/* Dialog Registrar */}
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
          {(!metrics.height_cm || metrics.height_cm <= 0) && (
            <TextField
              margin="dense"
              label="Altura (cm)"
              fullWidth
              value={newHeight}
              onChange={(e) => setNewHeight(e.target.value)}
              helperText="Ex.: 170"
              sx={{ mt: 2 }}
            />
          )}
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

      {/* Dialog Histórico */}
      <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Histórico de Pesos</DialogTitle>
        <DialogContent dividers>
          {errorLogs && <Alert severity="error" sx={{ mb: 2 }}>{errorLogs}</Alert>}
          {loadingLogs ? (
            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
          ) : logs.length === 0 ? (
            <Typography color="text.secondary">Nenhum registro ainda.</Typography>
          ) : (
            <List dense>
              {logs
                .slice()
                .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
                .map((log, idx) => (
                  <React.Fragment key={log.id}>
                    <ListItem>
                      <ListItemText
                        primary={`${log.weight} kg`}
                        secondary={formatDateBR(log.recorded_at)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="editar" onClick={() => onClickEdit(log)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="apagar" onClick={() => onDelete(log.id)} sx={{ ml: 1 }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {idx < logs.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      {/* Dialog Editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Editar Registro</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Peso (kg)"
            fullWidth
            value={editWeight}
            onChange={(e) => setEditWeight(e.target.value)}
            helperText="Use ponto ou vírgula"
          />
          <TextField
            margin="dense"
            label="Data e hora"
            type="datetime-local"
            fullWidth
            value={editDateLocal}
            onChange={(e) => setEditDateLocal(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancelar</Button>
          <Button onClick={onSaveEdit} variant="contained">Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
