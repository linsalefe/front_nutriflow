import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../contexts/LoadingContext';

export default function ListPage() {
  const [refeicoes, setRefeicoes] = useState<any[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setLoading } = useLoading();

  useEffect(() => {
    const fetchRefeicoes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:8000/api/meal/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRefeicoes(res.data);
      } catch (err: any) {
        setError('Erro ao carregar refeições.');
      } finally {
        setLoading(false);
      }
    };
    fetchRefeicoes();
  }, [setLoading]);

  if (error) {
    return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Histórico de Refeições
      </Typography>
      {refeicoes.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>Nenhuma refeição encontrada.</Alert>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 3, borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Data</strong></TableCell>
                <TableCell><strong>Análise</strong></TableCell>
                <TableCell><strong>Imagem</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {refeicoes.map((ref, idx) => (
                <TableRow
                  key={idx}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/meal/${ref.id}`)}
                >
                  <TableCell>{new Date(ref.data).toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{ref.analise}</TableCell>
                  <TableCell>
                    {ref.imagem_nome ? ref.imagem_nome : <em>Sem imagem</em>}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
