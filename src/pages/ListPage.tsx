// src/pages/ListPage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import api from '../services/api';

interface Refeicao {
  id: number;
  nome: string;
  calorias: number;
  criado_em: string;
}

export default function ListPage() {
  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = 240;

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Refeicao[]>('/meals');
        setRefeicoes(data);
      } catch (e) {
        console.error(e);
        setError('Erro ao carregar refeições.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
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

  return (
    <Box
      sx={{
        ml: isMobile ? 0 : `${drawerWidth}px`,
        px: isMobile ? 2 : 6,
        py: isMobile ? 3 : 6,
      }}
    >
      <Typography variant="h4" gutterBottom>
        Refeições
      </Typography>

      {error ? (
        <Typography color="error">{error}</Typography>
      ) : refeicoes.length === 0 ? (
        <Typography>Nenhuma refeição encontrada.</Typography>
      ) : (
        <Paper elevation={2}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Calorias</TableCell>
                <TableCell>Data</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refeicoes.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.nome}</TableCell>
                  <TableCell>{r.calorias}</TableCell>
                  <TableCell>
                    {new Date(r.criado_em).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
}
