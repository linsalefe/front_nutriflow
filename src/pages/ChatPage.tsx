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
  Avatar,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
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
        justifyContent: 'center',
        height: isMobile ? '100vh' : 'calc(100vh - 64px)',
        width: '100%',
        position: 'relative',
        backgroundColor: '#f5f5f5',
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 200, 120, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(100, 180, 100, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(140, 220, 140, 0.05) 0%, transparent 50%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.5,
          pointerEvents: 'none',
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: { xs: '100%', sm: '800px', md: '900px', lg: '1000px' },
          position: 'relative',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          boxShadow: { xs: 'none', md: '0 0 40px rgba(0,0,0,0.08)' },
        }}
      >
        {/* Sugestões - mobile no topo com tamanho reduzido */}
        <Box
          sx={{
            px: 1.5,
            py: 1,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(245,245,245,0.95) 100%)',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            overflowX: 'auto',
            display: { xs: 'flex', md: 'none' },
            gap: 0.75,
            backdropFilter: 'blur(10px)',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
            '-webkit-overflow-scrolling': 'touch',
          }}
        >
          {suggestions.map(s => (
            <Chip 
              key={s} 
              label={s} 
              clickable 
              onClick={() => setMensagem(s)} 
              size="small"
              sx={{ 
                flexShrink: 0,
                background: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
                color: 'white',
                border: 'none',
                fontWeight: 500,
                fontSize: '0.75rem',
                height: '28px',
                padding: '0 10px',
                transition: 'all 0.3s ease',
                '& .MuiChip-label': {
                  padding: '0 4px',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                }
              }} 
            />
          ))}
        </Box>

        {/* Histórico de mensagens - estilo WhatsApp otimizado */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 1, sm: 2 },
            py: 2,
            overflowY: 'auto',
            paddingBottom: { xs: '90px', sm: '20px' },
            '&::-webkit-scrollbar': {
              width: '8px',
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: '4px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(102, 187, 106, 0.4)',
              borderRadius: '4px',
              '&:hover': {
                backgroundColor: 'rgba(102, 187, 106, 0.6)',
              }
            },
          }}
        >
          {historico.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: isMobile ? 12 : 16,
                alignItems: 'flex-end',
                gap: 8,
              }}
            >
              {msg.role === 'bot' && (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    background: 'linear-gradient(135deg, #66bb6a 0%, #43a047 100%)',
                    boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
                  }}
                >
                  <SmartToyIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
              
              <Paper
                elevation={0}
                sx={{
                  maxWidth: { xs: '85%', sm: '75%' },
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 1.5, sm: 1.5 },
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                  color: msg.role === 'user'
                    ? 'white'
                    : theme.palette.text.primary,
                  borderRadius: msg.role === 'user'
                    ? { xs: '20px 20px 4px 20px', sm: '20px 20px 4px 20px' }
                    : { xs: '20px 20px 20px 4px', sm: '20px 20px 20px 4px' },
                  position: 'relative',
                  boxShadow: msg.role === 'user' 
                    ? '0 4px 16px rgba(102, 187, 106, 0.25)'
                    : '0 2px 12px rgba(0,0,0,0.08)',
                  border: msg.role === 'bot' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                  }
                }}
              >
                {msg.type === 'image' && msg.imageUrl && (
                  <Box 
                    sx={{ 
                      mb: 1.5,
                      overflow: 'hidden',
                      borderRadius: 2,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }}
                  >
                    <img
                      src={msg.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        maxWidth: isMobile ? '200px' : '100%',
                        display: 'block',
                        borderRadius: 8,
                      }}
                    />
                  </Box>
                )}
                <Typography
                  variant="body2"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontSize: { xs: '0.9rem', sm: '0.95rem' },
                    lineHeight: 1.6,
                    wordBreak: 'break-word',
                    fontWeight: msg.role === 'user' ? 500 : 400,
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
                      width: 28,
                      height: 28,
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      '.MuiPaper-root:hover &': {
                        opacity: 1,
                      },
                      '&:hover': {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                      }
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                )}
              </Paper>

              {msg.role === 'user' && (
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                    boxShadow: '0 2px 8px rgba(96, 125, 139, 0.3)',
                  }}
                >
                  <PersonIcon sx={{ fontSize: 18 }} />
                </Avatar>
              )}
            </motion.div>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Input fixo no rodapé - estilo WhatsApp para mobile */}
        <Box
          component="form"
          onSubmit={enviarMensagem}
          sx={{
            position: { xs: 'fixed', sm: 'relative' },
            bottom: { xs: 0, sm: 'auto' },
            left: { xs: 0, sm: 'auto' },
            right: { xs: 0, sm: 'auto' },
            px: { xs: 1.5, sm: 3 },
            py: { xs: 1.5, sm: 2 },
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.95), rgba(250,250,250,0.98))',
            borderTop: '1px solid rgba(0,0,0,0.06)',
            zIndex: { xs: 1000, sm: 'auto' },
            boxShadow: { xs: '0 -4px 20px rgba(0,0,0,0.08)', sm: '0 -2px 10px rgba(0,0,0,0.05)' },
            paddingBottom: { xs: 'calc(16px + env(safe-area-inset-bottom))', sm: '16px' },
            backdropFilter: 'blur(10px)',
          }}
        >
          <TextField
            fullWidth
            placeholder="Digite sua pergunta sobre nutrição..."
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
                    sx={{
                      width: 40,
                      height: 40,
                      mr: 0.5,
                      background: 'linear-gradient(135deg, #81c784 0%, #66bb6a 100%)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(102, 187, 106, 0.4)',
                      },
                      '&:disabled': {
                        opacity: 0.5,
                      }
                    }}
                  >
                    <PhotoCameraIcon sx={{ fontSize: 20 }} />
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
                      width: 40,
                      height: 40,
                      ml: 0.5,
                      background: !mensagem.trim() || imgLoading 
                        ? 'linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%)'
                        : 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                      color: 'white',
                      transition: 'all 0.3s ease',
                      '&:hover:not(:disabled)': {
                        transform: 'scale(1.05)',
                        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.4)',
                      },
                    }}
                  >
                    {imgLoading ? (
                      <CircularProgress size={18} sx={{ color: 'white' }} />
                    ) : (
                      <SendIcon sx={{ fontSize: 20 }} />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                fontSize: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0,0,0,0.1)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(102, 187, 106, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#66bb6a',
                  borderWidth: 2,
                },
              },
            }}
            sx={{
              '& .MuiInputBase-input': {
                fontSize: 16,
                padding: '12px 8px',
              },
            }}
          />
        </Box>

        {/* Snackbar - ajustado para mobile */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          sx={{
            bottom: { xs: 'calc(100px + env(safe-area-inset-bottom))', sm: '32px' },
          }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}