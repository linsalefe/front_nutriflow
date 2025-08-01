// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

interface Mensagem {
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  created_at: string;
}

const suggestions = [
  'Quantas calorias tem arroz, feijão e frango?',
  'Qual a quantidade ideal de proteína por dia?',
  'Como balancear proteínas e carboidratos?',
];

export default function ChatPage() {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [imgLoading, setImgLoading] = useState(false);
  const { setLoading } = useLoading();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<Mensagem[]>('/chat/history');
        setHistorico(data);
      } catch {
        setHistorico([
          {
            role: 'bot',
            text: 'Olá! Eu sou sua IA Nutricionista 😊\nPergunte algo ou escolha uma sugestão abaixo.',
            type: 'text',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    })();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico]);

  const saveMessage = async (msg: Mensagem) => {
    try {
      await api.post('/chat/save', msg);
    } catch {}
  };

  const enviarMensagem = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = mensagem.trim();
    if (!text) return;

    const userMsg: Mensagem = {
      role: 'user',
      text,
      type: 'text',
      created_at: new Date().toISOString(),
    };
    setHistorico(h => [...h, userMsg]);
    saveMessage(userMsg);
    setLoading(true);

    try {
      const { data } = await api.post<{ response: string }>('/chat/send', { message: text });
      const botMsg: Mensagem = {
        role: 'bot',
        text: data.response,
        type: 'text',
        created_at: new Date().toISOString(),
      };
      setHistorico(h => [...h, botMsg]);
      saveMessage(botMsg);
    } catch {
      const errMsg: Mensagem = {
        role: 'bot',
        text: 'Desculpe, houve um erro ao conectar.',
        type: 'text',
        created_at: new Date().toISOString(),
      };
      setHistorico(h => [...h, errMsg]);
      saveMessage(errMsg);
    } finally {
      setLoading(false);
      setMensagem('');
    }
  };

  const handleFile = async (file: File) => {
    setImgLoading(true);
    const preview = URL.createObjectURL(file);
    const userMsg: Mensagem = {
      role: 'user',
      text: file.name,
      type: 'image',
      imageUrl: preview,
      created_at: new Date().toISOString(),
    };
    setHistorico(h => [...h, userMsg]);
    saveMessage(userMsg);

    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/image/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const analysis = typeof data.analise === 'string' ? data.analise : JSON.stringify(data.analise);

      const botMsg: Mensagem = {
        role: 'bot',
        text: analysis,
        type: 'image',
        imageUrl: preview,
        created_at: new Date().toISOString(),
      };
      setHistorico(h => [...h, botMsg]);
      saveMessage(botMsg);
      setSnackbar({ open: true, message: 'Imagem analisada!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Falha ao analisar imagem.', severity: 'error' });
    } finally {
      setImgLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Copiado!', severity: 'success' });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: isMobile ? '100vh' : 'calc(100vh - 64px)',
        bgcolor: theme.palette.background.default,
      }}
    >
      {/* Sugestões fixas no topo */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          display: { xs: 'flex', md: 'none' },
          gap: 1,
        }}
      >
        {suggestions.map(s => (
          <Chip key={s} label={s} clickable onClick={() => setMensagem(s)} sx={{ flexShrink: 0 }} />
        ))}
      </Box>

      {/* Histórico de mensagens */}
      <Box
        sx={{
          flex: 1,
          px: 2,
          py: 1,
          overflowY: 'auto',
        }}
      >
        {historico.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: 8,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                maxWidth: '80%',
                px: 1.5,
                py: 1,
                bgcolor: msg.role === 'user'
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
                color: msg.role === 'user'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                borderRadius: msg.role === 'user'
                  ? '12px 12px 0 12px'
                  : '12px 12px 12px 0',
                position: 'relative',
              }}
            >
              {msg.type === 'image' && msg.imageUrl && (
                <Box sx={{ mb: 1 }}>
                  <img
                    src={msg.imageUrl}
                    alt=""
                    style={{ width: '100%', borderRadius: 8 }}
                  />
                </Box>
              )}
              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                {msg.text}
              </Typography>
              {msg.role === 'bot' && (
                <IconButton
                  size="small"
                  onClick={() => copyText(msg.text)}
                  sx={{ position: 'absolute', top: 4, right: 4 }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Input fixo no rodapé */}
      <Box
        component="form"
        onSubmit={enviarMensagem}
        sx={{
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <TextField
          fullWidth
          placeholder="Digite sua pergunta..."
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          multiline
          maxRows={4}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton component="label" disabled={imgLoading}>
                  <PhotoCameraIcon />
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={e => e.target.files && handleFile(e.target.files[0])}
                  />
                </IconButton>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton type="submit" disabled={!mensagem.trim() || imgLoading}>
                  {imgLoading ? <CircularProgress size={18} /> : <SendIcon />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            bgcolor: theme.palette.background.default,
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
