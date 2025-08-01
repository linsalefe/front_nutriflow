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
        position: 'relative',
      }}
    >
      {/* Sugestões - apenas para desktop */}
      <Box
        sx={{
          px: 2,
          py: 1,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          display: { xs: 'none', md: 'flex' },
          gap: 1,
        }}
      >
        {suggestions.map(s => (
          <Chip key={s} label={s} clickable onClick={() => setMensagem(s)} sx={{ flexShrink: 0 }} />
        ))}
      </Box>

      {/* Histórico de mensagens - otimizado estilo WhatsApp */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 1, sm: 2, md: 4 }, // padding horizontal ajustado para desktop
          py: { xs: 1, sm: 1 },
          overflowY: 'auto',
          paddingBottom: { xs: '10px', sm: '10px' },
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.light,
            borderRadius: '2px',
          },
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
              marginBottom: isMobile ? 6 : 8,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                maxWidth: { xs: '90%', sm: '80%' },
                px: { xs: 1.2, sm: 1.5 },
                py: { xs: 1, sm: 1 },
                bgcolor: msg.role === 'user'
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
                color: msg.role === 'user'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
                borderRadius: msg.role === 'user'
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                position: 'relative',
                boxShadow: { xs: '0 1px 2px rgba(0,0,0,0.1)', sm: 1 },
              }}
            >
              {msg.type === 'image' && msg.imageUrl && (
                <Box sx={{ mb: 1 }}>
                  <img
                    src={msg.imageUrl}
                    alt=""
                    style={{ 
                      width: '100%', 
                      maxWidth: isMobile ? '200px' : '100%',
                      borderRadius: 8 
                    }}
                  />
                </Box>
              )}
              <Typography 
                variant="body2" 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontSize: { xs: '0.875rem', sm: '0.875rem' },
                  lineHeight: { xs: 1.4, sm: 1.5 },
                  wordBreak: 'break-word',
                }}
              >
                {msg.text}
              </Typography>
              {msg.role === 'bot' && (
                <IconButton
                  size="small"
                  onClick={() => copyText(msg.text)}
                  sx={{ 
                    position: 'absolute', 
                    top: { xs: 2, sm: 4 }, 
                    right: { xs: 2, sm: 4 },
                    width: { xs: '24px', sm: '32px' },
                    height: { xs: '24px', sm: '32px' },
                  }}
                >
                  <ContentCopyIcon 
                    sx={{ 
                      fontSize: { xs: '14px', sm: '16px' }
                    }} 
                  />
                </IconButton>
              )}
            </Paper>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Input fixo no rodapé - estilo WhatsApp */}
      <Box
        component="form"
        onSubmit={enviarMensagem}
        sx={{
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          px: { xs: 1, sm: 2 },
          py: { xs: 1, sm: 1 },
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          zIndex: { xs: 1000, sm: 'auto' },
          boxShadow: { xs: '0 -2px 8px rgba(0,0,0,0.1)', sm: 'none' },
          paddingBottom: { xs: 'calc(8px + env(safe-area-inset-bottom))', sm: '8px' },
        }}
      >
        <TextField
          fullWidth
          placeholder="Digite sua pergunta..."
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          multiline
          maxRows={isMobile ? 4 : 4}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconButton 
                  component="label" 
                  disabled={imgLoading}
                  sx={{
                    width: { xs: '40px', sm: '40px' },
                    height: { xs: '40px', sm: '40px' },
                    mr: { xs: 0.5, sm: 0 },
                  }}
                >
                  <PhotoCameraIcon 
                    sx={{ fontSize: { xs: '22px', sm: '24px' } }} 
                  />
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
                <IconButton 
                  type="submit" 
                  disabled={!mensagem.trim() || imgLoading}
                  sx={{
                    width: { xs: '40px', sm: '40px' },
                    height: { xs: '40px', sm: '40px' },
                    ml: { xs: 0.5, sm: 0 },
                  }}
                >
                  {imgLoading ? (
                    <CircularProgress size={isMobile ? 18 : 18} />
                  ) : (
                    <SendIcon sx={{ fontSize: { xs: '22px', sm: '24px' } }} />
                  )}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: { xs: '16px', sm: '16px' },
              minHeight: { xs: '48px', sm: '56px' },
            }
          }}
          sx={{
            bgcolor: theme.palette.background.default,
            borderRadius: { xs: 6, sm: 2 },
            '& .MuiOutlinedInput-root': {
              paddingRight: { xs: '4px', sm: '12px' },
              paddingLeft: { xs: '4px', sm: '12px' },
            },
            '& .MuiInputBase-input': {
              fontSize: { xs: '16px', sm: '16px' },
              padding: { xs: '12px 8px', sm: '16.5px 14px' },
            }
          }}
        />
      </Box>

      {/* Snackbar - ajustado para mobile */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: 'center' 
        }}
        sx={{
          bottom: { xs: 'calc(80px + env(safe-area-inset-bottom))', sm: '24px' },
        }}
      >
        <Alert 
          severity={snackbar.severity}
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
