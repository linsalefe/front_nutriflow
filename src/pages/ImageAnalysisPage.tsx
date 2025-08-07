import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Snackbar,
  Alert,
  Stack,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useLoading } from '../contexts/LoadingContext';

interface AnalysisResult {
  fileName: string;
  analysis: string;
}

export default function ImageAnalysisPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const { setLoading } = useLoading();
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setResult('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0]);
      setResult('');
    }
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.post(
        '/image/analyze',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      const analysis = typeof data.analise === 'string'
        ? data.analise
        : JSON.stringify(data.analise);
      setResult(analysis);
      setHistory(h => [{ fileName: file.name, analysis }, ...h]);
      setSnackbar({ open: true, message: 'Imagem analisada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao analisar imagem.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 'calc(100vh - 128px)',
        bgcolor: 'grey.50',
      }}
    >
      <Grid container spacing={3} sx={{ height: '100%' }}>
        {/* COLUNA DE ANÁLISE */}
        <Grid item xs={12} lg={6}>
          <Paper
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            elevation={3}
            sx={{
              p: 4,
              borderRadius: 3,
              bgcolor: 'background.paper',
              height: 'fit-content',
              border: '2px dashed',
              borderColor: file ? 'primary.main' : 'grey.300',
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.main',
                boxShadow: theme.shadows[6],
              },
            }}
          >
            <Typography variant="h4" fontWeight={700} gutterBottom color="primary.main">
              🍽️ Análise Nutricional
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Fotografe sua refeição e descubra calorias e macros instantaneamente
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={4}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  size="large"
                  sx={{ 
                    py: 2, 
                    borderRadius: 3,
                    borderWidth: 2,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    '&:hover': {
                      borderWidth: 2,
                    }
                  }}
                >
                  {file ? 'Alterar Imagem' : 'Escolher Imagem'}
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    onChange={handleFileChange}
                  />
                </Button>

                {preview && (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={preview}
                      alt="Prévia"
                      sx={{ 
                        maxWidth: '100%', 
                        maxHeight: '300px',
                        borderRadius: 3,
                        boxShadow: theme.shadows[4],
                      }}
                    />
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  disabled={!file}
                  size="large"
                  sx={{ 
                    py: 2, 
                    borderRadius: 3,
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(45deg, #4CAF50 30%, #66BB6A 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388E3C 30%, #4CAF50 90%)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                    }
                  }}
                >
                  {!file ? '📸 Enviar para Análise' : '🔍 Analisar Imagem'}
                  {file && <CircularProgress size={20} sx={{ color: 'white', ml: 1 }} />}
                </Button>

                {result && (
                  <Card 
                    sx={{ 
                      borderRadius: 3, 
                      bgcolor: 'success.50',
                      border: '1px solid',
                      borderColor: 'success.200',
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Typography variant="h6" fontWeight={600} gutterBottom color="success.main">
                        ✅ Resultado da Análise
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          lineHeight: 1.6,
                        }}
                      >
                        {result}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* COLUNA HISTÓRICO E DICAS */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Histórico */}
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 3, 
                bgcolor: 'background.paper',
                maxHeight: '400px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: 'grey.100',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: 'grey.400',
                  borderRadius: '4px',
                  '&:hover': {
                    background: 'grey.600',
                  },
                },
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom color="primary.main">
                📋 Histórico de Análises
              </Typography>
              {history.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    🍽️ Nenhuma análise realizada ainda
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Envie uma foto para começar!
                  </Typography>
                </Box>
              ) : (
                history.map((item, idx) => (
                  <Card 
                    key={idx} 
                    sx={{ 
                      mb: 2, 
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: 'grey.100',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.shadows[4],
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <CardContent sx={{ p: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                        📎 {item.fileName}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          whiteSpace: 'pre-wrap',
                          mt: 1,
                          fontSize: '0.9rem',
                        }}
                      >
                        {item.analysis.length > 150 
                          ? `${item.analysis.substring(0, 150)}...` 
                          : item.analysis
                        }
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Paper>

            {/* Dicas */}
            <Paper elevation={3} sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper' }}>
              <Typography variant="h6" fontWeight={600} gutterBottom color="info.main">
                💡 Dicas para Melhores Fotos
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>☀️</Typography>
                  <Typography variant="body2">
                    Garanta boa iluminação natural
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>🎯</Typography>
                  <Typography variant="body2">
                    Centralize o prato na imagem
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>🚫</Typography>
                  <Typography variant="body2">
                    Evite sombras e reflexos
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>📏</Typography>
                  <Typography variant="body2">
                    Mantenha uma distância adequada
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}