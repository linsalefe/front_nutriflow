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
        height: '100vh',
        width: '100%',
        bgcolor: theme.palette.background.default,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sugestões - apenas para desktop */}
      <Box
        sx={{
          px: 3,
          py: 2,
          bgcolor: theme.palette.background.paper,
          borderBottom: `1px solid ${theme.palette.divider}`,
          overflowX: 'auto',
          display: { xs: 'none', md: 'flex' },
          gap: 1.5,
          flexShrink: 0,
          '&::-webkit-scrollbar': {
            height: '4px',
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
        {suggestions.map(s => (
          <Chip 
            key={s} 
            label={s} 
            clickable 
            onClick={() => setMensagem(s)} 
            sx={{ 
              flexShrink: 0,
              '&:hover': {
                backgroundColor: theme.palette.primary.light,
              }
            }} 
          />
        ))}
      </Box>

      {/* Histórico de mensagens */}
      <Box
        sx={{
          flex: 1,
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.05)',
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.primary.light,
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: theme.palette.primary.main,
            }
          },
        }}
      >
        {historico.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              width: '100%',
            }}
          >
            <Paper
              elevation={1}
              sx={{
                maxWidth: { xs: '85%', sm: '75%', md: '65%' },
                px: 2,
                py: 1.5,
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
                border: msg.role === 'bot' ? `1px solid ${theme.palette.divider}` : 'none',
              }}
            >
              {msg.type === 'image' && msg.imageUrl && (
                <Box sx={{ mb: 1 }}>
                  <img
                    src={msg.imageUrl}
                    alt=""
                    style={{
                      width: '100%',
                      maxWidth: '300px',
                      height: 'auto',
                      borderRadius: 8,
                      display: 'block',
                    }}
                  />
                </Box>
              )}
              <Typography
                variant="body2"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: 1.6,
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
                    top: 4,
                    right: 4,
                    opacity: 0.7,
                    '&:hover': {
                      opacity: 1,
                    }
                  }}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              )}
            </Paper>
          </motion.div>
        ))}
        <div ref={chatEndRef} />
      </Box>

      {/* Input no rodapé */}
      <Box
        component="form"
        onSubmit={enviarMensagem}
        sx={{
          px: { xs: 2, sm: 3, md: 4 },
          py: 2,
          bgcolor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
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
                <IconButton
                  component="label"
                  disabled={imgLoading}
                  sx={{ mr: 1 }}
                >
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
                <IconButton
                  type="submit"
                  disabled={!mensagem.trim() || imgLoading}
                  color="primary"
                >
                  {imgLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <SendIcon />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: theme.palette.background.default,
            },
          }}
        />
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}