// src/pages/ChatPage.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  List,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Drawer,
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CircleIcon from '@mui/icons-material/Circle';
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from '@mui/icons-material/Close';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';
import { useSearchParams } from 'react-router-dom';

// 👉 novo: componente de cards da análise
import NutritionalAnalysis from '../components/NutritionalAnalysis';

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

const LINA_AVATAR = '/lina-avatar.png';
const URL_RX = /(https?:\/\/[^\s]+)/i;
const isUrl = (s: string) => /^https?:\/\/\S+$/i.test(s);

// --- layout ---
const LEFT_SIDEBAR_WIDTH = 240;
const HISTORY_WIDTH = 300;
const MAX_CHAT_WIDTH = 920;

// datas
const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const dayKey = (d: Date | string) => {
  const x = typeof d === 'string' ? new Date(d) : d;
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}`;
};
const labelFromKey = (key: string) => {
  const todayKey = dayKey(new Date());
  const yesterdayKey = dayKey(new Date(Date.now() - 86400000));
  if (key === todayKey) return 'Hoje';
  if (key === yesterdayKey) return 'Ontem';
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

// remove duplicatas consecutivas
function dedupeStrict(list: Mensagem[]): Mensagem[] {
  const out: Mensagem[] = [];
  for (const m of list) {
    const prev = out[out.length - 1];
    const same =
      prev &&
      prev.role === m.role &&
      (prev.type ?? 'text') === (m.type ?? 'text') &&
      (prev.text.trim() || '') === (m.text.trim() || '') &&
      (prev.imageUrl || '') === (m.imageUrl || '');
    if (same) continue;
    out.push(m);
  }
  return out;
}

export default function ChatPage() {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(dayKey(new Date()));
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

  const [historyOpenDesktop, setHistoryOpenDesktop] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const historyParamOpen = searchParams.get('history') === '1';
  const [historyOpenMobile, setHistoryOpenMobile] = useState<boolean>(historyParamOpen);

  const { setLoading } = useLoading();

  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  const [inputHeight, setInputHeight] = useState<number>(96);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const measureInput = useCallback(() => {
    const h = inputWrapRef.current?.offsetHeight || 96;
    setInputHeight(h);
  }, []);
  useEffect(() => {
    measureInput();
    window.addEventListener('resize', measureInput);
    return () => window.removeEventListener('resize', measureInput);
  }, [measureInput]);
  useEffect(() => { measureInput(); }, [mensagem, isTyping, imgLoading, measureInput]);

  useEffect(() => { setHistoryOpenMobile(historyParamOpen); }, [historyParamOpen]);

  const openMobileHistory = () => {
    const sp = new URLSearchParams(searchParams);
    sp.set('history', '1');
    setSearchParams(sp, { replace: true });
  };
  const closeMobileHistory = () => {
    const sp = new URLSearchParams(searchParams);
    sp.delete('history');
    setSearchParams(sp, { replace: true });
  };

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); setSnackbar({ open: true, message: 'Conexão restabelecida.', severity: 'success' }); };
    const onOffline = () => { setIsOnline(false); setSnackbar({ open: true, message: 'Sem conexão com a internet.', severity: 'error' }); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: hist }, { data: meData }] = await Promise.all([
          api.get<{ history: Mensagem[] }>('/chat/history'),
          api.get('/user/me'),
        ]);

        let base: Mensagem[];
        const serverHist = (hist?.history || []) as Mensagem[];

        if (serverHist.length) base = dedupeStrict(serverHist);
        else {
          base = [{
            role: 'bot',
            text: 'Olá! Eu sou a Lina, sua assistente nutricional 😊\n\nComo posso ajudar você hoje? Você pode me perguntar sobre calorias, proteínas, dietas ou enviar fotos de alimentos!',
            type: 'text',
            created_at: new Date().toISOString(),
          }];
        }

        setHistorico(base);
        setMe(meData || {});
        const last = base[base.length - 1];
        setSelectedDayKey(dayKey(last?.created_at || new Date()));
      } catch {
        const fallback: Mensagem[] = [{
          role: 'bot',
          text: 'Olá! Eu sou a Lina, sua assistente nutricional 😊\n\nComo posso ajudar você hoje? Você pode me perguntar sobre calorias, proteínas, dietas ou enviar fotos de alimentos!',
          type: 'text',
          created_at: new Date().toISOString(),
        }];
        setHistorico(fallback);
        setSelectedDayKey(dayKey(new Date()));
      }
    })();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [historico, isTyping, selectedDayKey]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    const gap = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(gap > 120);
  }, []);
  useEffect(() => {
    const el = scrollRef.current; if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ae = document.activeElement?.tagName?.toLowerCase();
      const isTypingInField = ae === 'input' || ae === 'textarea';
      if (e.key === '/' && !isTypingInField) { e.preventDefault(); inputRef.current?.focus(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const saveMessage = async (msg: Mensagem) => { try { await api.post('/chat/save', msg); } catch {} };
  const formatTime = (s: string) => new Date(s).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const handleSuggestionClick = (s: string) => { setMensagem(s); inputRef.current?.focus(); };

  const renderMessageText = (text: string) => {
    const parts = text.split(/(\s+)/);
    return (
      <>
        {parts.map((part, idx) => {
          if (isUrl(part)) return <Link key={idx} href={part} target="_blank" rel="noopener noreferrer" underline="hover">{part}</Link>;
          if (URL_RX.test(part) && !isUrl(part)) {
            const sub = part.split(/(https?:\/\/[^\s]+)/g);
            return (
              <React.Fragment key={idx}>
                {sub.map((sp, i2) => isUrl(sp)
                  ? <Link key={`${idx}-${i2}`} href={sp} target="_blank" rel="noopener noreferrer" underline="hover">{sp}</Link>
                  : <React.Fragment key={`${idx}-${i2}`}>{sp}</React.Fragment>)}
              </React.Fragment>
            );
          }
          return <React.Fragment key={idx}>{part}</React.Fragment>;
        })}
      </>
    );
  };

  const sendText = async (text: string) => {
    const now = new Date();
    const userMsg: Mensagem = { role: 'user', text, type: 'text', created_at: now.toISOString() };
    setHistorico(h => dedupeStrict([...h, userMsg]));
    setSelectedDayKey(dayKey(now));
    saveMessage(userMsg);
    setLoading(true); setIsTyping(true);

    try {
      const { data } = await api.post<{ response: string }>('/chat/send', { message: text });
      const botMsg: Mensagem = { role: 'bot', text: data.response, type: 'text', created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, botMsg])); saveMessage(botMsg); setRetryText(null);
    } catch {
      const errMsg: Mensagem = { role: 'bot', text: 'Desculpe, houve um erro ao conectar. Tente novamente.', type: 'text', created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, errMsg])); saveMessage(errMsg); setRetryText(text);
    } finally { setLoading(false); setIsTyping(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); formRef.current?.requestSubmit(); }
  };

  const enviarMensagem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = mensagem.trim(); if (!text) return;
    setMensagem(''); await sendText(text);
  };

  const handlePaste: React.ClipboardEventHandler = (e) => {
    const files = (e.clipboardData && e.clipboardData.files) || null;
    if (files && files.length > 0 && files[0].type.startsWith('image/')) { e.preventDefault(); handleFile(files[0]); }
  };

  const handleRetry = async () => { if (retryText) await sendText(retryText); };

  const handleFile = async (file: File) => {
    if (!file || !file.type?.startsWith('image/')) return;
    setImgLoading(true);
    const preview = URL.createObjectURL(file);
    const now = new Date();
    const userMsg: Mensagem = { role: 'user', text: '', type: 'image', imageUrl: preview, created_at: now.toISOString() };
    setHistorico(h => dedupeStrict([...h, userMsg]));
    setSelectedDayKey(dayKey(now)); saveMessage(userMsg); setIsTyping(true);

    try {
      const form = new FormData(); form.append('file', file);
      const { data } = await api.post('/image/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const analysis = typeof data.analise === 'string' ? data.analise : JSON.stringify(data.analise);
      const botMsg: Mensagem = { role: 'bot', text: analysis, type: 'image', imageUrl: preview, created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, botMsg])); saveMessage(botMsg);
      setSnackbar({ open: true, message: 'Imagem analisada com sucesso!', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Falha ao analisar imagem.', severity: 'error' });
    } finally { setImgLoading(false); setIsTyping(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); };

  const copyText = (text: string) => { navigator.clipboard.writeText(text); setSnackbar({ open: true, message: 'Mensagem copiada!', severity: 'success' }); };

  const groups = useMemo(() => {
    const map = new Map<string, Mensagem[]>();
    for (const m of historico) { const k = dayKey(m.created_at); if (!map.has(k)) map.set(k, []); map.get(k)!.push(m); }
    for (const [k, arr] of map.entries()) {
      arr.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      map.set(k, dedupeStrict(arr));
    }
    return Array.from(map.entries()).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  }, [historico]);

  const visibleMessages = useMemo(() => (groups.find(([k]) => k === selectedDayKey)?.[1] ?? []), [groups, selectedDayKey]);

  useEffect(() => {
    const keys = groups.map(([k]) => k);
    if (!keys.includes(selectedDayKey) && keys.length) setSelectedDayKey(keys[0]);
  }, [groups, selectedDayKey]);

  const makePreview = (msgs: Mensagem[]) => {
    const last = [...msgs].reverse().find(m => (m.text && m.text.trim()) || m.type === 'image');
    if (!last) return 'Sem mensagens';
    if (last.type === 'image' && !last.text) return '📷 Imagem enviada';
    return (last.text || '').replace(/\s+/g, ' ').slice(0, 80);
  };

  const renderHistoryList = () => (
    <List dense disablePadding subheader={<li />} sx={{ maxHeight: '100%', overflowY: 'auto' }}>
      {groups.length === 0 && (<Box sx={{ p: 2 }}><Typography variant="body2" color="text.secondary">Sem conversas ainda.</Typography></Box>)}
      {groups.map(([k, msgs]) => (
        <li key={k}>
          <ul style={{ padding: 0, margin: 0 }}>
            <ListSubheader disableSticky sx={{ bgcolor: '#fff', fontWeight: 600 }}>{labelFromKey(k)}</ListSubheader>
            <ListItemButton selected={selectedDayKey === k} onClick={() => setSelectedDayKey(k)} sx={{ alignItems: 'flex-start' }}>
              <ListItemText
                primary={makePreview(msgs)}
                primaryTypographyProps={{ noWrap: true, style: { fontSize: 13, lineHeight: 1.3, maxWidth: HISTORY_WIDTH - 70 } }}
                secondary={`${msgs.length} mensagens`}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </ListItemButton>
            <Divider component="li" />
          </ul>
        </li>
      ))}
    </List>
  );

  const centerColSx = { width: '100%', maxWidth: `${MAX_CHAT_WIDTH}px`, mx: 'auto' as const };

  return (
    <Box sx={{ display: 'flex', height: { xs: '100dvh', md: 'calc(100vh - 64px)' }, width: '100%', position: 'relative', backgroundColor: '#f5f7f5', marginLeft: { xs: 0, md: `${LEFT_SIDEBAR_WIDTH}px` } }}>
      {/* Chat */}
      <Box sx={{ flex: '1 1 auto', minWidth: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(255,255,255,0.86)', backdropFilter: 'blur(8px)', boxShadow: { xs: 'none', md: '0 0 32px rgba(0,0,0,0.06)' } }}>
        {/* Cabeçalho */}
        <Box sx={{ position: 'sticky', top: 0, zIndex: 3, background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          <Box sx={{ ...centerColSx, px: { xs: 1.5, md: 2 }, py: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={LINA_AVATAR} alt="Lina" sx={{ width: 36, height: 36, boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)', border: '2px solid #fff', bgcolor: '#7AA374' }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>Lina • Assistente Nutricional</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircleIcon sx={{ fontSize: 10, color: isOnline ? '#4caf50' : '#f44336' }} />
                <Typography variant="caption" color="text.secondary">{isOnline ? 'online' : 'offline'}</Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Button
                size="small"
                onClick={() => setHistoryOpenDesktop(v => !v)}
                variant={historyOpenDesktop ? 'outlined' : 'contained'}
                sx={{ textTransform: 'none' }}
              >
                {historyOpenDesktop ? 'Fechar histórico' : 'Histórico'}
              </Button>
            )}

            {isMobile && (
              <Tooltip title="Abrir histórico">
                <IconButton onClick={openMobileHistory}><HistoryIcon /></IconButton>
              </Tooltip>
            )}

            {retryText && (
              <Tooltip title="Tentar novamente o último envio">
                <span><Button size="small" startIcon={<RestartAltIcon />} onClick={handleRetry} disabled={isTyping} variant="outlined">Tentar novamente</Button></span>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Sugestões */}
        {!isMobile && historico.length <= 1 && (
          <Fade in timeout={800}>
            <Box sx={{ ...centerColSx, px: 3, pt: 3, pb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Sugestões de perguntas:</Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {suggestions.map((s, i) => (<Chip key={i} label={s} onClick={() => handleSuggestionClick(s)} />))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Fade>
        )}

        {/* Mensagens */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          onDragOver={(e)=>{e.preventDefault(); setIsDragging(true);}}
          onDragLeave={(e)=>{e.preventDefault(); setIsDragging(false);}}
          onDrop={(e)=>{e.preventDefault(); setIsDragging(false); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f);}}
          onPaste={handlePaste}
          sx={{ flex: 1, overflowY: 'auto', position: 'relative', pb: { xs: `${inputHeight + 24}px`, sm: 2 } }}
        >
          <Box sx={{ ...centerColSx, px: { xs: 1, sm: 2 }, pt: 2 }}>
            {isDragging && (
              <Box onDragOver={(e) => e.preventDefault()} sx={{ position: 'fixed', inset: 0, zIndex: 5, border: '2px dashed rgba(102,187,106,0.6)', borderRadius: 2, backgroundColor: 'rgba(102,187,106,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <Typography sx={{ fontWeight: 600 }}>Solte a imagem aqui para analisar 📷</Typography>
              </Box>
            )}

            <AnimatePresence>
              {visibleMessages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}-${msg.created_at}`}
                  layout initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 14, alignItems: 'flex-end', gap: 8 }}
                >
                  {msg.role === 'bot' && (
                    <Zoom in timeout={300}>
                      <Avatar src={LINA_AVATAR} alt="Lina" sx={{ width: 32, height: 32, boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)', border: '2px solid #fff', bgcolor: '#7AA374' }} />
                    </Zoom>
                  )}

                  <Box sx={{ maxWidth: { xs: '94%', sm: '82%', md: '70%' } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        px: { xs: 2, sm: 2.5 }, py: { xs: 1.5, sm: 1.5 },
                        background: msg.role === 'user' ? 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        color: msg.role === 'user' ? 'white' : theme.palette.text.primary,
                        borderRadius: msg.role === 'user' ? { xs: '18px 18px 6px 18px', sm: '18px 18px 6px 18px' } : { xs: '18px 18px 18px 6px', sm: '18px 18px 18px 6px' },
                        position: 'relative',
                        boxShadow: msg.role === 'user' ? '0 6px 18px rgba(102, 187, 106, 0.25)' : '0 2px 12px rgba(0,0,0,0.06)',
                        border: msg.role === 'bot' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        maxWidth: 680,
                      }}
                    >
                      {/* 👉 integração: quando for resposta do BOT de IMAGEM, usa os cards */}
                      {msg.type === 'image' && msg.role === 'bot'
                        ? <NutritionalAnalysis text={msg.text} />
                        : msg.text?.trim() && (
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: { xs: '0.95rem', sm: '0.98rem' }, lineHeight: 1.6, wordBreak: 'break-word', fontWeight: msg.role === 'user' ? 500 : 400 }}>
                            {renderMessageText(msg.text)}
                          </Typography>
                        )
                      }

                      {msg.role === 'bot' && (
                        <IconButton size="small" onClick={() => copyText(msg.text)} sx={{ position: 'absolute', top: 4, right: 4, width: 28, height: 28, opacity: 0.9, backgroundColor: 'rgba(0,0,0,0.04)', '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' } }}>
                          <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                      )}
                    </Paper>

                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5, px: 1, opacity: 0.6, textAlign: msg.role === 'user' ? 'right' : 'left', color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'text.secondary' }}>
                      {formatTime(msg.created_at)}
                    </Typography>
                  </Box>

                  {msg.role === 'user' && (
                    <Zoom in timeout={300}>
                      <Avatar src={me.avatar_url || undefined} sx={{ width: 32, height: 32, background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)' }}>
                        {!me.avatar_url && <PersonIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                    </Zoom>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <Avatar src={LINA_AVATAR} alt="Lina" sx={{ width: 32, height: 32, boxShadow: '0 2px 8px rgba(102, 187, 106, 0.3)', border: '2px solid #fff', bgcolor: '#7AA374' }} />
                <Paper elevation={0} sx={{ px: 3, py: 1.5, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '18px 18px 18px 6px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box component={motion.div} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity }} sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a' }} />
                  <Box component={motion.div} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} sx={{ width: 8, height: 8, borderRadius: '50%' , backgroundColor: '#66bb6a' }} />
                  <Box component={motion.div} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#66bb6a' }} />
                </Paper>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </Box>

          <Zoom in={showScrollBottom}>
            <Badge color="success" invisible={!showScrollBottom} sx={{ position: 'fixed', right: 16, bottom: { xs: inputHeight + 24, sm: 24 }, zIndex: 20 }}>
              <Tooltip title="Ir para a última mensagem">
                <IconButton onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })} sx={{ background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)', color: '#fff' }}>
                  <KeyboardDoubleArrowDownIcon />
                </IconButton>
              </Tooltip>
            </Badge>
          </Zoom>
        </Box>

        {/* Input */}
        <Box component="form" ref={formRef} onSubmit={enviarMensagem} onPaste={handlePaste} sx={{ position: { xs: 'sticky', sm: 'relative' }, bottom: 0, left: 0, right: 0, zIndex: { xs: 10, sm: 'auto' }, background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(250,250,250,0.98))', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
          <Box ref={inputWrapRef} sx={{ ...centerColSx, px: { xs: 1.5, sm: 3 }, py: { xs: 1.25, sm: 2 } }}>
            {retryText && (
              <Alert severity="warning" sx={{ mb: 1.25 }} action={<Button color="inherit" size="small" startIcon={<RestartAltIcon />} onClick={handleRetry}>Tentar novamente</Button>}>
                <AlertTitle>Falha no envio</AlertTitle>
                Clique em "Tentar novamente" para reenviar sua última mensagem.
              </Alert>
            )}

            <TextField
              fullWidth
              placeholder="Digite sua pergunta sobre nutrição..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={4}
              disabled={isTyping}
              inputRef={inputRef}
              helperText={<Box sx={{ display: 'flex', justifyContent: 'space-between' }}><span>Shift+Enter: nova linha • "/": focar campo</span><span>{mensagem.length}/1000</span></Box>}
              inputProps={{ maxLength: 1000 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Tooltip title="Anexar imagem para análise">
                      <span>
                        <IconButton component="label" disabled={imgLoading || isTyping} sx={{ width: 40, height: 40, mr: 0.5, bgcolor: '#66bb6a', color: 'white', '&:hover': { opacity: .9 } }}>
                          <PhotoCameraIcon sx={{ fontSize: 20 }} />
                          <input hidden type="file" accept="image/*" ref={fileInputRef} onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title={(!mensagem.trim() || imgLoading || isTyping) ? '' : 'Enviar'}>
                      <span>
                        <IconButton type="submit" disabled={!mensagem.trim() || imgLoading || isTyping} sx={{ width: 40, height: 40, ml: 0.5, bgcolor: '#4caf50', color: 'white', '&:hover': { opacity: .9 } }}>
                          {imgLoading || isTyping ? <CircularProgress size={18} sx={{ color: 'white' }} /> : <SendIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiInputBase-input': { fontSize: 16, padding: '12px 8px' } }}
            />
          </Box>
        </Box>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          sx={{ bottom: { xs: 'calc(100px + env(safe-area-inset-bottom))', sm: '32px' } }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>

      {/* Painel (desktop) */}
      {!isMobile && (
        <Box sx={{ width: historyOpenDesktop ? HISTORY_WIDTH : 0, transition: 'width .25s ease', overflow: 'hidden', borderLeft: historyOpenDesktop ? '1px solid rgba(0,0,0,0.08)' : 'none', backgroundColor: '#fff' }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">Histórico</Typography>
            <IconButton size="small" onClick={() => setHistoryOpenDesktop(false)}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Divider />
          <Box sx={{ height: 'calc(100% - 48px)', p: 1.5 }}>{renderHistoryList()}</Box>
        </Box>
      )}

      {/* Drawer (mobile) */}
      {isMobile && (
        <Drawer anchor="right" open={historyOpenMobile} onClose={closeMobileHistory} ModalProps={{ keepMounted: true }} PaperProps={{ sx: { width: '88vw' } }}>
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2">Histórico</Typography>
            <IconButton size="small" onClick={closeMobileHistory}><CloseIcon fontSize="small" /></IconButton>
          </Box>
          <Divider />
          <Box sx={{ height: '100%', p: 1.5 }}>{renderHistoryList()}</Box>
        </Drawer>
      )}
    </Box>
  );
}
