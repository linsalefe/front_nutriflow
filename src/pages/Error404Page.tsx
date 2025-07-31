import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Error404Page() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Typography variant="h1" fontWeight={900} color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Página não encontrada
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Opa! Parece que você tentou acessar uma página que não existe.
      </Typography>
      <Button variant="contained" color="primary" onClick={() => navigate('/')}>
        Voltar para o início
      </Button>
    </Box>
  );
}
