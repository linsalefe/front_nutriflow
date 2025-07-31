import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { setLoading } = useLoading();
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Preview selecionado
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  // Seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile(e.target.files[0]);
      setResult('');
    }
  };

  // Drag & drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) {
      setFile(e.dataTransfer.files[0]);
      setResult('');
    }
  };
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axios.post(
        'http://localhost:8000/api/image/analyze',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      const analysis = typeof data.analise === 'string'
        ? data.analise
        : JSON.stringify(data.analise);
      setResult(analysis);
      setHistory((h) => [{ fileName: file.name, analysis }, ...h]);
      setSnackbar({ open: true, message: 'Imagem analisada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Erro ao analisar imagem.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', p: 3, bgcolor: 'grey.100', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {/* AREA DE ANALISE */}
        <Grid item xs={12} md={6}>
          <Paper
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            elevation={4}
            sx={{ p: 4, borderRadius: 4, bgcolor: 'background.paper', height: '100%' }}
          >
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Análise Nutricional por Imagem
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Stack spacing={3}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCameraIcon />}
                  sx={{ py: 1.5, borderRadius: 2 }}
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
                    <img
                      src={preview}
                      alt="Prévia"
                      style={{ maxWidth: '100%', borderRadius: 8 }}
                    />
                  </Box>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={!file}
                  sx={{ alignSelf: 'flex-start', minWidth: 160, py: 1.5, borderRadius: 2 }}
                >
                  Analisar{ ' ' }
                  {file && <CircularProgress size={18} sx={{ color: 'white', ml: 1 }} />}
                </Button>

                {result && (
                  <Card sx={{ borderRadius: 3, bgcolor: 'grey.50' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        Resultado da Análise:
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {result}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            </Box>
          </Paper>
        </Grid>

        {/* HISTÓRICO E DICAS */}
        <Grid item xs={12} md={6}>
          <Stack spacing={3} sx={{ height: '100%' }}>
            <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper', flex: 1, overflowY: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Histórico de Análises
              </Typography>
              {history.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Nenhuma análise realizada ainda.
                </Typography>
              ) : (
                history.map((item, idx) => (
                  <Box key={idx} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.fileName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                      {item.analysis}
                    </Typography>
                  </Box>
                ))
              )}
            </Paper>

            <Paper elevation={4} sx={{ p: 3, borderRadius: 4, bgcolor: 'background.paper' }}>
              <Typography variant="h6" gutterBottom>
                Dicas para Fotos
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Garanta boa iluminação natural.
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                • Centralize o prato na imagem.
              </Typography>
              <Typography variant="body2">
                • Evite sombras e reflexos.
              </Typography>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

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
