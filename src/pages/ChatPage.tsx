// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Fade,
  Zoom,
  Link,
  Badge,
  Tooltip,
  Divider,
  AlertTitle,
  Button,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CircleIcon from '@mui/icons-material/Circle';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';

interface Mensagem {
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  created_at: string;
}

const suggestions = [
  'Quantas calorias tem uma banana?',
  'Qual a quantidade ideal de proteína por dia?',
  'Como balancear proteínas e carboidratos?',
  'Dicas para emagrecer com saúde',
];

// Caminho do avatar da Lina (coloque o arquivo em /public)
const LINA_AVATAR = '/lina-avatar.png';

// Regex simples para URLs
const URL_RX = /(https?:\/\/[^\s]+)/i;
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);

export default function ChatPage() {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [imgLoading, setImgLoading] = useState(false);
  const [me, setMe] = useState<{ avatar_url?: string }>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [retryText, setRetryText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { setLoading } = useLoading();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastPromptRef = useRef<string>('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Header "online"
  useEffect(() => {
    const onOnline = () => {
      setIsOnline(true);
      setSnackbar({ open: true, message: 'Conexão restabelecida.', severity: 'success' });
    };
    const onOffline = () => {
      setIsOnline(false);
      setSnackbar({ open: true, message: 'Sem conexão com a internet.', severity: 'error' });
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Carrega histórico + perfil
  useEffect(() => {
    (async () => {
      try {
        const [{ data: hist }, { data: meData }] = await Promise.all([
          api.get<{ history: Mensagem[] }>('/chat/history'),
          api.get('/user/me'),
        ]);
        setHistorico(hist.history || []);
        setMe(meData || {});
      } catch {
        setHistorico([
          {
            role: 'bot',
            text: 'Olá! Eu sou a Lina, sua assistente nutricional 😊\n\nComo posso ajudar você hoje? Você pode me perguntar sobre calorias, proteínas, dietas ou enviar fotos de alimentos!',
            type: 'text',
            created_at: new Date().toISOString(),
          },
        ]);
      }
    })();
  }, []);

  // Auto-scroll ao fim em novas msgs/typing
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico, isTyping]);

  // Observa scroll para exibir botão "ir para o fim"
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(gap > 120);
  }, []);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Atalho "/" foca no input (quando não focado em input/textarea)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement?.tagName?.toLowerCase();
      const isTypingInField = ae === 'input' || ae === 'textarea';
      if (e.key === '/' && !isTypingInField) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const saveMessage = async (msg: Mensagem) => {
    try {
      await api.post('/chat/save', msg);
    } catch {}
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSuggestionClick = (suggestion: string) => {
    setMensagem(suggestion);
    inputRef.current?.focus();
  };

  // Renderiza texto com linkify (sem libs extras)
  const renderMessageText = (text: string) => {
    const parts = text.split(/(\s+)/); // preserva espaços
    return (
      <>
        {parts.map((part, idx) => {
          if (isUrl(part)) {
            return (
              <Link
                key={idx}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
              >
                {part}
              </Link>
            );
          }
          // Para casos "texto(https://...)" ainda pega
          if (URL_RX.test(part) && !isUrl(part)) {
            const subParts = part.split(/(https?:\/\/[^\s]+)/g);
            return (
              <React.Fragment key={idx}>
                {subParts.map((sp, i2) =>
                  isUrl(sp) ? (
                    <Link key={`${idx}-${i2}`} href={sp} target="_blank" rel="noopener noreferrer" underline="hover">
                      {sp}
                    </Link>
                  ) : (
                    <React.Fragment key={`${idx}-${i2}`}>{sp}</React.Fragment>
                  ),
                )}
              </React.Fragment>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  // Envio de texto (extraído para reuso no retry)
  const sendText = async (text: string) => {
    const userMsg: Mensagem = {
      role: 'user',
      text,
      type: 'text',
      created_at: new Date().toISOString(),
    };
    setHistorico(h => [...h, userMsg]);
    saveMessage(userMsg);
    setLoading(true);
    setIsTyping(true);
    lastPromptRef.current = text;

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
      setRetryText(null);
    } catch {
      const errMsg: Mensagem = {
        role: 'bot',
        text: 'Desculpe, houve um erro ao conectar. Tente novamente.',
        type: 'text',
        created_at: new Date().toISOString(),
      };
      setHistorico(h => [...h, errMsg]);
      saveMessage(errMsg);
      setRetryText(text);
    } finally {
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Detecta Enter sem Shift
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = mensagem.trim();
      if (text) {
        setMensagem('');
        sendText(text);
      }
    }
  };

  // Aceita FormEvent ou KeyboardEvent
  const enviarMensagem = async (
    e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    const text = mensagem.trim();
    if (!text) return;
    setMensagem('');
    await sendText(text);
  };

  const handleRetry = async () => {
    if (!retryText) return;
    await sendText(retryText);
  };

  const handleFile = async (file: File) => {
    if (!file || !file.type?.startsWith('image/')) return;
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
    setIsTyping(true);

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
      setSnackbar({ open: true, message: 'Imagem analisada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Falha ao analisar imagem.', severity: 'error' });
    } finally {
      setImgLoading(false);
      setIsTyping(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Drag & Drop imagem no corpo do chat
  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // Paste imagem direto no campo
  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const files = e.clipboardData?.files;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) {
      e.preventDefault();
      handleFile(files[0]);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Mensagem copiada!', severity: 'success' });
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
        marginLeft: { xs: 0, md: '240px' }, // evita sobreposição do sidebar no desktop
        backgroundImage: `
          radial-gradient(circle at 20% 80%, rgba(120, 200, 120, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 80% 20%, rgba(100, 180, 100, 0.1) 0%, transparent 50%),
          radial-gradient(circle at 40% 40%, rgba(140, 220, 140, 0.05) 0%, transparent 50%)
        `,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
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
        {/* Cabeçalho fixo com status */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 3,
            px: 2,
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            borderBottom: '1px solid rgba(0,0,0,0.06)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Avatar
            src={LINA_AVATAR}
            alt="Lina"
            sx={{
              width: 36, height: 36,
              boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
              border: '2px solid #fff',
              bgcolor: '#7AA374',
            }}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>Lina • Assistente Nutricional</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CircleIcon sx={{ fontSize: 10, color: isOnline ? '#4caf50' : '#f44336' }} />
              <Typography variant="caption" color="text.secondary">
                {isOnline ? 'online' : 'offline'}
              </Typography>
            </Box>
          </Box>
          {retryText && (
            <Tooltip title="Tentar novamente o último envio">
              <span>
                <Button
                  size="small"
                  startIcon={<RestartAltIcon />}
                  onClick={handleRetry}
                  disabled={isTyping}
                  variant="outlined"
                >
                  Tentar novamente
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>

        {!isMobile && historico.length <= 1 && (
          <Fade in timeout={800}>
            <Box sx={{ px: 3, pt: 3, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                Sugestões de perguntas:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {suggestions.map((suggestion, index) => (
                  <Chip
                    key={index}
                    label={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    sx={{
                      cursor: 'pointer',
                      backgroundColor: 'rgba(102, 187, 106, 0.1)',
                      border: '1px solid rgba(102, 187, 106, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 187, 106, 0.2)',
                        borderColor: 'rgba(102, 187, 106, 0.5)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Fade>
        )}

        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          sx={{
            flex: 1,
            px: { xs: 1, sm: 2 },
            py: 2,
            overflowY: 'auto',
            // CORRIGIDO: Aumentei o paddingBottom no mobile de 90px para 140px
            paddingBottom: { xs: '140px', sm: '20px' },
            position: 'relative',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-track': { backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '4px' },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(102, 187, 106, 0.4)',
              borderRadius: '4px',
              '&:hover': { backgroundColor: 'rgba(102, 187, 106, 0.6)' }
            },
          }}
        >
          {/* Overlay de drop */}
          {isDragging && (
            <Box
              onDragOver={onDragOver}
              sx={{
                position: 'absolute',
                inset: 0,
                zIndex: 5,
                border: '2px dashed rgba(102,187,106,0.6)',
                borderRadius: 2,
                backgroundColor: 'rgba(102,187,106,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <Typography sx={{ fontWeight: 600 }}>Solte a imagem aqui para analisar 📷</Typography>
            </Box>
          )}

          <AnimatePresence>
            {historico.map((msg, i) => (
              <motion.div
                key={`${msg.role}-${i}-${msg.created_at}`}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                  delay: i === historico.length - 1 ? 0.05 : 0
                }}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: isMobile ? 12 : 16,
                  alignItems: 'flex-end',
                  gap: 8,
                }}
              >
                {msg.role === 'bot' && (
                  <Zoom in timeout={300}>
                    <Avatar
                      src={LINA_AVATAR}
                      alt="Lina"
                      sx={{
                        width: 32,
                        height: 32,
                        boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
                        border: '2px solid #fff',
                        bgcolor: '#7AA374',
                      }}
                    />
                  </Zoom>
                )}

                <Box sx={{ maxWidth: { xs: '85%', sm: '75%' } }}>
                  <Paper
                    elevation={0}
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      py: { xs: 1.5, sm: 1.5 },
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)'
                        : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                      color: msg.role === 'user' ? 'white' : theme.palette.text.primary,
                      borderRadius: msg.role === 'user'
                        ? { xs: '20px 20px 4px 20px', sm: '20px 20px 4px 20px' }
                        : { xs: '20px 20px 20px 4px', sm: '20px 20px 20px 4px' },
                      position: 'relative',
                      boxShadow: msg.role === 'user'
                        ? '0 4px 16px rgba(102, 187, 106, 0.25)'
                        : '0 2px 12px rgba(0,0,0,0.08)',
                      border: msg.role === 'bot' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: msg.role === 'user'
                          ? '0 6px 20px rgba(102, 187, 106, 0.35)'
                          : '0 4px 16px rgba(0,0,0,0.12)',
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
                      {renderMessageText(msg.text)}
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
                          '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                        }}
                      >
                        <ContentCopyIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Paper>

                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      px: 1,
                      opacity: 0.6,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                      color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                    }}
                  >
                    {formatTime(msg.created_at)}
                  </Typography>
                </Box>

                {msg.role === 'user' && (
                  <Zoom in timeout={300}>
                    <Avatar
                      src={me.avatar_url || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)',
                        boxShadow: '0 2px 8px rgba(96, 125, 139, 0.3)',
                      }}
                    >
                      {!me.avatar_url && <PersonIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                  </Zoom>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Avatar
                src={LINA_AVATAR}
                alt="Lina"
                sx={{
                  width: 32,
                  height: 32,
                  boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)',
                  border: '2px solid #fff',
                  bgcolor: '#7AA374',
                }}
              />
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 1.5,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '20px 20px 20px 4px',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  component={motion.div}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity }}
                  sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a' }}
                />
                <Box
                  component={motion.div}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }}
                  sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a' }}
                />
                <Box
                  component={motion.div}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }}
                  sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a' }}
                />
              </Paper>
            </motion.div>
          )}

          {/* Botão ir para o fim */}
          <Zoom in={showScrollBottom}>
            <Badge
              color="success"
              invisible={!showScrollBottom}
              sx={{
                position: 'absolute',
                right: 16,
                bottom: 16,
                zIndex: 2,
              }}
            >
              <Tooltip title="Ir para a última mensagem">
                <IconButton
                  onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  sx={{
                    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
                    color: '#fff',
                    boxShadow: '0 6px 20px rgba(102,187,106,0.35)',
                    '&:hover': { transform: 'translateY(-2px)' },
                  }}
                >
                  <KeyboardDoubleArrowDownIcon />
                </IconButton>
              </Tooltip>
            </Badge>
          </Zoom>

          <div ref={chatEndRef} />
        </Box>

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
          {/* Barra de aviso de retry */}
          {retryText && (
            <Alert
              severity="warning"
              sx={{ mb: 1.5 }}
              action={
                <Button color="inherit" size="small" startIcon={<RestartAltIcon />} onClick={handleRetry}>
                  Tentar novamente
                </Button>
              }
            >
              <AlertTitle>Falha no envio</AlertTitle>
              Clique em "Tentar novamente" para reenviar sua última mensagem.
            </Alert>
          )}

          <TextField
            fullWidth
            placeholder="Digite sua pergunta sobre nutrição..."
            value={mensagem}
            onChange={e => setMensagem(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={onPaste}
            multiline
            maxRows={4}
            disabled={isTyping}
            inputRef={inputRef}
            helperText={
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Shift+Enter: nova linha • "/": focar campo</span>
                <span>{mensagem.length}/1000</span>
              </Box>
            }
            inputProps={{ maxLength: 1000 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="Anexar imagem para análise">
                    <span>
                      <IconButton
                        component="label"
                        disabled={imgLoading || isTyping}
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
                          '&:disabled': { opacity: 0.5 }
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
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title={(!mensagem.trim() || imgLoading || isTyping) ? '' : 'Enviar'}>
                    <span>
                      <IconButton
                        type="submit"
                        disabled={!mensagem.trim() || imgLoading || isTyping}
                        sx={{
                          width: 40,
                          height: 40,
                          ml: 0.5,
                          background: !mensagem.trim() || imgLoading || isTyping
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
                        {imgLoading || isTyping ? (
                          <CircularProgress size={18} sx={{ color: 'white' }} />
                        ) : (
                          <SendIcon sx={{ fontSize: 20 }} />
                        )}
                      </IconButton>
                    </span>
                  </Tooltip>
                </InputAdornment>
              ),
              sx: {
                fontSize: 16,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: 3,
                '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0,0,0,0.1)' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(102, 187, 106, 0.3)' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#66bb6a', borderWidth: 2 },
                '&.Mui-disabled': { backgroundColor: 'rgba(245, 245, 245, 0.9)' }
              },
            }}
            sx={{
              '& .MuiInputBase-input': { fontSize: 16, padding: '12px 8px' },
            }}
          />
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 'calc(100px + env(safe-area-inset-bottom))', sm: '32px' } }}
        >
          <Alert
            severity={snackbar.severity}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
}
