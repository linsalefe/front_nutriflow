import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Card, CardContent, Typography, Button, CircularProgress, Alert } from '@mui/material';

export default function MealDetailPage() {
  const { id } = useParams();
  const [refeicao, setRefeicao] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRefeicao = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:8000/api/meal/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRefeicao(res.data);
      } catch {
        setError('Erro ao carregar refeição.');
      } finally {
        setLoading(false);
      }
    };
    fetchRefeicao();
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!refeicao) return null;

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Card sx={{ p: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight={700} gutterBottom>Detalhe da Refeição</Typography>
          <Typography><strong>Data:</strong> {new Date(refeicao.data).toLocaleString('pt-BR')}</Typography>
          <Typography sx={{ mt: 2 }}><strong>Análise:</strong></Typography>
          <Typography>{refeicao.analise}</Typography>
          {refeicao.imagem_nome && (
            <>
              <Typography sx={{ mt: 2 }}><strong>Imagem:</strong></Typography>
              <img
                src={`CAMINHO_DA_IMAGEM/${refeicao.imagem_nome}`}
                alt="Imagem da refeição"
                style={{ maxWidth: '100%', borderRadius: 8, marginTop: 8 }}
              />
            </>
          )}
          <Button variant="outlined" sx={{ mt: 3 }} onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
