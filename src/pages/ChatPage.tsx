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
  Popper,
  LinearProgress,
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
import ImageIcon from '@mui/icons-material/Image';
import { motion, AnimatePresence } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';
import { useSearchParams } from 'react-router-dom';

// 👉 componente de cards da análise
import NutritionalAnalysis from '../components/NutritionalAnalysis';

interface Mensagem {
  role: 'user' | 'bot';
  text: string;
  type?: 'text' | 'image';
  imageUrl?: string;
  created_at: string;
}

type SlashCommand = { cmd: string; label: string; template: string };

const SLASH_COMMANDS: SlashCommand[] = [
  { cmd: '/meta', label: 'Definir/ajustar meta diária', template: 'Quero definir minha meta diária. Meu objetivo é (emagrecer/manter/ganhar). Peso atual: __ kg, altura: __ cm, idade: __, nível de atividade: (baixo/médio/alto). Calcule kcal e macros.' },
  { cmd: '/calorias', label: 'Quanto comer hoje', template: 'Quantas kcal devo consumir hoje e como dividir em proteínas, carboidratos e gorduras? Mostre também fibra recomendada.' },
  { cmd: '/plano', label: 'Plano de refeições do dia', template: 'Monte um plano de refeições para hoje (café, almoço, jantar e 1 lanche) com 2-3 opções por refeição, incluindo kcal e macros.' },
  { cmd: '/historico', label: 'Ver resumo do dia', template: 'Mostre meu resumo de consumo de hoje (kcal e macros), o que falta para bater a meta e 1 sugestão de ajuste.' },
  { cmd: '/limpar', label: 'Começar nova conversa', template: '' },
  { cmd: '/ajuda', label: 'Como usar a Lina', template: 'Quais coisas posso fazer aqui? Me dê exemplos de perguntas úteis e como enviar imagem para análise.' },
];

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

// ======= 🎨 NOVA FUNÇÃO: Tema baseado na hora =======
const getThemeByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Manhã - cores frescas
    return {
      primary: '#4fc3f7', // azul claro
      secondary: '#81c784', // verde suave
      background: 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)',
      name: 'morning'
    };
  } else if (hour >= 12 && hour < 18) {
    // Tarde - cores neutras
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(135deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon'
    };
  } else {
    // Noite - cores quentes
    return {
      primary: '#ff8a65', // laranja suave
      secondary: '#ffb74d', // amarelo dourado
      background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening'
    };
  }
};

// ======= 📱 NOVA FUNÇÃO: Renderizar texto com formatação rica =======
const parseMessageText = (text: string) => {
  if (!text) return [];

  const parts: Array<{ type: 'text' | 'bold' | 'link'; content: string; url?: string }> = [];
  let currentPos = 0;
  
  // Regex para encontrar **texto** e URLs
  const combinedRegex = /(\*\*([^*]+)\*\*|https?:\/\/[^\s]+)/g;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Adiciona texto antes do match
    if (match.index > currentPos) {
      const beforeText = text.slice(currentPos, match.index);
      if (beforeText) {
        parts.push({ type: 'text', content: beforeText });
      }
    }

    if (match[0].startsWith('http')) {
      // É uma URL
      parts.push({ type: 'link', content: match[0], url: match[0] });
    } else {
      // É texto em negrito (**texto**)
      parts.push({ type: 'bold', content: match[2] });
    }

    currentPos = match.index + match[0].length;
  }

  // Adiciona texto restante
  if (currentPos < text.length) {
    const remainingText = text.slice(currentPos);
    if (remainingText) {
      parts.push({ type: 'text', content: remainingText });
    }
  }

  return parts;
};

const renderFormattedText = (text: string, themeColors: any) => {
  const parts = parseMessageText(text);
  
  return (
    <>
      {parts.map((part, idx) => {
        switch (part.type) {
          case 'bold':
            return (
              <Typography
                key={idx}
                component="span"
                sx={{
                  fontWeight: 700,
                  fontSize: 'inherit',
                  color: 'inherit',
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                {part.content}
              </Typography>
            );
          case 'link':
            return (
              <Link
                key={idx}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                underline="hover"
                sx={{
                  color: themeColors.primary,
                  fontWeight: 500,
                  wordBreak: 'break-all',
                }}
              >
                {part.content}
              </Link>
            );
          default:
            return <React.Fragment key={idx}>{part.content}</React.Fragment>;
        }
      })}
    </>
  );
};

// ======= 📷 UTIL: compressão de imagem no cliente =======
const MAX_DIM = 1600;
const JPEG_QUALITY = 0.82;

function formatBytes(n: number) {
  const u = ['B', 'KB', 'MB', 'GB'];
  let i = 0; let v = n;
  while (v >= 1024 && i < u.length - 1) { v /= 1024; i++; }
  return `${v.toFixed(v < 10 && i > 0 ? 1 : 0)}${u[i]}`;
}

async function readAsDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => res(String(fr.result));
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

async function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number): Promise<Blob> {
  return new Promise((res) => canvas.toBlob((b) => res(b as Blob), type, quality));
}

async function compressImage(file: File, maxDim = MAX_DIM, quality = JPEG_QUALITY): Promise<{
  blob: Blob; width: number; height: number; originalBytes: number; compressedBytes: number; usedOriginal: boolean;
}> {
  const originalBytes = file.size;

  let dataURL: string;
  try {
    dataURL = await readAsDataURL(file);
  } catch {
    return { blob: file, width: 0, height: 0, originalBytes, compressedBytes: originalBytes, usedOriginal: true };
  }

  let img: HTMLImageElement;
  try {
    img = await loadImage(dataURL);
  } catch {
    return { blob: file, width: 0, height: 0, originalBytes, compressedBytes: originalBytes, usedOriginal: true };
  }

  const { width, height } = img;
  if (Math.max(width, height) <= maxDim && /image\/jpe?g/i.test(file.type) && originalBytes < 900 * 1024) {
    return { blob: file, width, height, originalBytes, compressedBytes: originalBytes, usedOriginal: true };
  }

  const scale = maxDim / Math.max(width, height);
  const w = scale < 1 ? Math.round(width * scale) : width;
  const h = scale < 1 ? Math.round(height * scale) : height;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return { blob: file, width, height, originalBytes, compressedBytes: originalBytes, usedOriginal: true };

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, w, h);

  const outBlob = await canvasToBlob(canvas, 'image/jpeg', quality);
  if (!outBlob) return { blob: file, width, height, originalBytes, compressedBytes: originalBytes, usedOriginal: true };

  if (outBlob.size >= originalBytes) {
    return { blob: file, width, height, originalBytes, compressedBytes: originalBytes, usedOriginal: true };
  }

  return { blob: outBlob, width: w, height: h, originalBytes, compressedBytes: outBlob.size, usedOriginal: false };
}

export default function ChatPage() {
  const [mensagem, setMensagem] = useState('');
  const [historico, setHistorico] = useState<Mensagem[]>([]);
  const [selectedDayKey, setSelectedDayKey] = useState<string>(dayKey(new Date()));
  const [isTyping, setIsTyping] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });
  const [imgLoading, setImgLoading] = useState(false);
  const [me, setMe] = useState<{ avatar_url?: string }>({});
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [retryText, setRetryText] = useState<string | null>(null);
  
  // ======= 🎨 NOVOS ESTADOS =======
  const [dragImagePreview, setDragImagePreview] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [themeColors, setThemeColors] = useState(getThemeByTime());

  const [historyOpenDesktop, setHistoryOpenDesktop] = useState<boolean>(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const historyParamOpen = searchParams.get('history') === '1';
  const [historyOpenMobile, setHistoryOpenMobile] = useState<boolean>(historyParamOpen);

  // Command Palette
  const [slashOpen, setSlashOpen] = useState(false);
  const [slashFilter, setSlashFilter] = useState('');
  const [slashIndex, setSlashIndex] = useState(0);

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

  // ======= 🎨 ATUALIZAR TEMA POR HORA =======
  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    
    const interval = setInterval(updateTheme, 60000); // a cada minuto
    return () => clearInterval(interval);
  }, []);

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

  const sendText = async (text: string) => {
    const now = new Date();
    const userMsg: Mensagem = { role: 'user', text, type: 'text', created_at: now.toISOString() };
    setHistorico(h => dedupeStrict([...h, userMsg]));
    setSelectedDayKey(dayKey(now));
    saveMessage(userMsg);
    setLoading(true); 
    setIsTyping(true);
    setLoadingMessage('Lina está pensando...');

    try {
      const { data } = await api.post<{ response: string }>('/chat/send', { message: text });
      const botMsg: Mensagem = { role: 'bot', text: data.response, type: 'text', created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, botMsg])); 
      saveMessage(botMsg); 
      setRetryText(null);
    } catch {
      const errMsg: Mensagem = { role: 'bot', text: 'Desculpe, houve um erro ao conectar. Tente novamente.', type: 'text', created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, errMsg])); 
      saveMessage(errMsg); 
      setRetryText(text);
    } finally { 
      setLoading(false); 
      setIsTyping(false); 
      setLoadingMessage('');
    }
  };

  const handleRetry = async () => { if (retryText) await sendText(retryText); };

  const handleFile = async (file: File) => {
    if (!file || !file.type?.startsWith('image/')) return;
    setImgLoading(true);
    setLoadingMessage('Lina está analisando sua imagem...');

    try {
      const { blob, originalBytes, compressedBytes, usedOriginal } = await compressImage(file);
      const finalBlob = blob;
      const finalFile = new File([finalBlob], (file.name || 'upload') + (finalBlob.type === 'image/jpeg' && !/\.jpe?g$/i.test(file.name) ? '.jpg' : ''), { type: finalBlob.type });

      const preview = URL.createObjectURL(finalBlob);
      const now = new Date();
      const userMsg: Mensagem = { role: 'user', text: '', type: 'image', imageUrl: preview, created_at: now.toISOString() };
      setHistorico(h => dedupeStrict([...h, userMsg]));
      setSelectedDayKey(dayKey(now)); 
      saveMessage(userMsg); 
      setIsTyping(true);

      if (!usedOriginal) {
        const pct = Math.max(0, Math.round((1 - compressedBytes / originalBytes) * 100));
        setSnackbar({ open: true, message: `Imagem otimizada: ${formatBytes(originalBytes)} → ${formatBytes(compressedBytes)} (-${pct}%)`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: `Imagem enviada (${formatBytes(originalBytes)})`, severity: 'success' });
      }

      const form = new FormData();
      form.append('file', finalFile);
      const { data } = await api.post('/image/analyze', form, { headers: { 'Content-Type': 'multipart/form-data' } });

      const analysis = typeof data.analise === 'string' ? data.analise : JSON.stringify(data.analise);
      const botMsg: Mensagem = { role: 'bot', text: analysis, type: 'image', imageUrl: preview, created_at: new Date().toISOString() };
      setHistorico(h => dedupeStrict([...h, botMsg])); 
      saveMessage(botMsg);

    } catch (e) {
      setSnackbar({ open: true, message: 'Falha ao analisar imagem.', severity: 'error' });
    } finally {
      setImgLoading(false); 
      setIsTyping(false);
      setLoadingMessage('');
      setDragImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ======= 📷 DRAG & DROP MELHORADO COM PREVIEW =======
  const onDragOver = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(true);
    
    // Criar preview da imagem
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      const item = items[0];
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          const preview = URL.createObjectURL(file);
          setDragImagePreview(preview);
        }
      }
    }
  };

  const onDragLeave = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false);
    setDragImagePreview(null);
  };

  const onDrop = (e: React.DragEvent) => { 
    e.preventDefault(); 
    setIsDragging(false); 
    setDragImagePreview(null);
    const f = e.dataTransfer.files?.[0]; 
    if (f) handleFile(f); 
  };

  const copyText = (text: string) => { 
    navigator.clipboard.writeText(text); 
    setSnackbar({ open: true, message: 'Mensagem copiada!', severity: 'success' }); 
  };

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

  const filteredSlash = useMemo(() => {
    const q = slashFilter.trim().toLowerCase();
    if (!q) return SLASH_COMMANDS;
    return SLASH_COMMANDS.filter((c) => c.cmd.toLowerCase().includes(q) || c.label.toLowerCase().includes(q));
  }, [slashFilter]);

  useEffect(() => {
    if (!mensagem.startsWith('/')) { setSlashOpen(false); setSlashFilter(''); setSlashIndex(0); return; }
    const q = mensagem.slice(1);
    setSlashFilter(q);
    setSlashOpen(true);
    setSlashIndex(0);
  }, [mensagem]);

  const applySlash = (item: SlashCommand | undefined) => {
    if (!item) return;
    if (item.cmd === '/limpar') {
      setHistorico([]);
      setMensagem('');
      setSelectedDayKey(dayKey(new Date()));
      setSlashOpen(false);
      return;
    }
    setMensagem(item.template || '');
    setSlashOpen(false);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (slashOpen) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSlashIndex(i => Math.min(i + 1, Math.max(0, filteredSlash.length - 1))); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSlashIndex(i => Math.max(i - 1, 0)); return; }
      if (e.key === 'Enter') { e.preventDefault(); applySlash(filteredSlash[slashIndex] || filteredSlash[0]); return; }
      if (e.key === 'Escape') { e.preventDefault(); setSlashOpen(false); return; }
      if (e.key === 'Enter' && e.shiftKey) return;
    }
    if (e.key === 'Enter' && !e.shiftKey && !slashOpen) { e.preventDefault(); formRef.current?.requestSubmit(); }
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

  return (
    <Box sx={{ 
      display: 'flex', 
      height: { xs: '100dvh', md: 'calc(100vh - 64px)' }, 
      width: '100%', 
      position: 'relative', 
      background: themeColors.background,
      marginLeft: { xs: 0, md: `${LEFT_SIDEBAR_WIDTH}px` } 
    }}>
      {/* Chat */}
      <Box sx={{ 
        flex: '1 1 auto', 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'rgba(255,255,255,0.86)', 
        backdropFilter: 'blur(8px)', 
        boxShadow: { xs: 'none', md: '0 0 32px rgba(0,0,0,0.06)' } 
      }}>
        {/* Cabeçalho */}
        <Box sx={{ 
          position: 'sticky', 
          top: 0, 
          zIndex: 3, 
          background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.75))', 
          borderBottom: '1px solid rgba(0,0,0,0.06)' 
        }}>
          <Box sx={{ 
            ...centerColSx, 
            px: { xs: 1.5, md: 2 }, 
            py: 1.25, 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <Avatar 
              src={LINA_AVATAR} 
              alt="Lina" 
              sx={{ 
                width: 36, 
                height: 36, 
                boxShadow: `0 2px 8px ${themeColors.primary}40`, 
                border: '2px solid #fff', 
                bgcolor: themeColors.primary 
              }} 
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>Lina • Assistente Nutricional</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CircleIcon sx={{ fontSize: 10, color: isOnline ? themeColors.secondary : '#f44336' }} />
                <Typography variant="caption" color="text.secondary">
                  {isOnline ? 'online' : 'offline'} • {themeColors.name === 'morning' ? 'Bom dia!' : themeColors.name === 'afternoon' ? 'Boa tarde!' : 'Boa noite!'}
                </Typography>
              </Box>
            </Box>

            {!isMobile && (
              <Button 
                size="small" 
                onClick={() => setHistoryOpenDesktop(v => !v)} 
                variant={historyOpenDesktop ? 'outlined' : 'contained'} 
                sx={{ 
                  textTransform: 'none',
                  bgcolor: historyOpenDesktop ? 'transparent' : themeColors.primary,
                  borderColor: themeColors.primary,
                  color: historyOpenDesktop ? themeColors.primary : 'white',
                  '&:hover': {
                    bgcolor: historyOpenDesktop ? `${themeColors.primary}10` : themeColors.secondary
                  }
                }}
              >
                {historyOpenDesktop ? 'Fechar histórico' : 'Histórico'}
              </Button>
            )}

            {isMobile && (
              <Tooltip title="Abrir histórico">
                <IconButton onClick={openMobileHistory} sx={{ color: themeColors.primary }}>
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
            )}

            {retryText && (
              <Tooltip title="Tentar novamente o último envio">
                <span>
                  <Button 
                    size="small" 
                    startIcon={<RestartAltIcon />} 
                    onClick={handleRetry} 
                    disabled={isTyping} 
                    variant="outlined"
                    sx={{ 
                      borderColor: themeColors.primary,
                      color: themeColors.primary,
                      '&:hover': { bgcolor: `${themeColors.primary}10` }
                    }}
                  >
                    Tentar novamente
                  </Button>
                </span>
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
                {suggestions.map((s, i) => (
                  <Chip 
                    key={i} 
                    label={s} 
                    onClick={() => handleSuggestionClick(s)}
                    sx={{
                      bgcolor: `${themeColors.primary}15`,
                      color: themeColors.primary,
                      '&:hover': { bgcolor: `${themeColors.primary}25` }
                    }}
                  />
                ))}
              </Box>
              <Divider sx={{ mt: 2 }} />
            </Box>
          </Fade>
        )}

        {/* Barra de progresso para carregamento */}
        {(isTyping || imgLoading) && (
          <Box sx={{ position: 'relative' }}>
            <LinearProgress 
              sx={{
                height: 3,
                bgcolor: `${themeColors.primary}20`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: themeColors.primary
                }
              }}
            />
            {loadingMessage && (
              <Typography 
                variant="caption" 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  left: 16, 
                  color: themeColors.primary, 
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              >
                {loadingMessage}
              </Typography>
            )}
          </Box>
        )}

        {/* Mensagens */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={handlePaste}
          sx={{ 
            flex: 1, 
            overflowY: 'auto', 
            position: 'relative', 
            pb: { xs: `${inputHeight + 24}px`, sm: 2 } 
          }}
        >
          <Box sx={{ ...centerColSx, px: { xs: 1, sm: 2 }, pt: 2 }}>
            {/* ======= 📷 OVERLAY DE DRAG MELHORADO ======= */}
            {isDragging && (
              <Box 
                onDragOver={(e) => e.preventDefault()} 
                sx={{ 
                  position: 'fixed', 
                  inset: 0, 
                  zIndex: 5, 
                  border: `2px dashed ${themeColors.primary}99`, 
                  borderRadius: 2, 
                  backgroundColor: `${themeColors.primary}05`, 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  pointerEvents: 'none',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <ImageIcon sx={{ fontSize: 64, color: themeColors.primary, mb: 2 }} />
                  <Typography sx={{ fontWeight: 600, color: themeColors.primary, mb: 1 }}>
                    Solte a imagem aqui para analisar 📷
                  </Typography>
                  
                  {/* Preview da imagem */}
                  {dragImagePreview && (
                    <Box
                      sx={{
                        mt: 2,
                        border: `2px solid ${themeColors.primary}`,
                        borderRadius: 2,
                        overflow: 'hidden',
                        maxWidth: 200,
                        maxHeight: 200,
                        boxShadow: `0 8px 32px ${themeColors.primary}40`
                      }}
                    >
                      <img
                        src={dragImagePreview}
                        alt="Preview"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />
                    </Box>
                  )}
                </motion.div>
              </Box>
            )}

            <AnimatePresence>
              {visibleMessages.map((msg, i) => (
                <motion.div
                  key={`${msg.role}-${i}-${msg.created_at}`}
                  layout 
                  initial={{ opacity: 0, y: 20, scale: 0.98 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{ 
                    display: 'flex', 
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', 
                    marginBottom: 16, 
                    alignItems: 'flex-end', 
                    gap: 8 
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
                          boxShadow: `0 2px 8px ${themeColors.primary}40`, 
                          border: '2px solid #fff', 
                          bgcolor: themeColors.primary 
                        }} 
                      />
                    </Zoom>
                  )}

                  <Box sx={{ maxWidth: { xs: '92%', sm: '85%', md: '75%' } }}>
                    <Paper
                      elevation={0}
                      sx={{
                        px: { xs: 2.5, sm: 3 }, 
                        py: { xs: 2, sm: 2.2 },
                        background: msg.role === 'user' 
                          ? `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)` 
                          : 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                        color: msg.role === 'user' ? 'white' : theme.palette.text.primary,
                        borderRadius: msg.role === 'user' 
                          ? { xs: '20px 20px 8px 20px', sm: '22px 22px 8px 22px' } 
                          : { xs: '20px 20px 20px 8px', sm: '22px 22px 22px 8px' },
                        position: 'relative',
                        boxShadow: msg.role === 'user' 
                          ? `0 8px 24px ${themeColors.primary}35` 
                          : '0 4px 16px rgba(0,0,0,0.08)',
                        border: msg.role === 'bot' ? '1px solid rgba(0,0,0,0.06)' : 'none',
                        maxWidth: { xs: '100%', sm: 680 },
                      }}
                    >
                      {/* 👉 quando for resposta do BOT de IMAGEM, usa os cards */}
                      {msg.type === 'image' && msg.role === 'bot'
                        ? <NutritionalAnalysis text={msg.text} />
                        : msg.text?.trim() && (
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              whiteSpace: 'pre-wrap', 
                              fontSize: { xs: '1rem', sm: '1.02rem' }, 
                              lineHeight: { xs: 1.7, sm: 1.65 },
                              wordBreak: 'break-word', 
                              fontWeight: msg.role === 'user' ? 500 : 400,
                              letterSpacing: { xs: '0.01em', sm: '0.005em' }
                            }}
                          >
                            {renderFormattedText(msg.text, themeColors)}
                          </Typography>
                        )
                      }

                      {msg.role === 'bot' && (
                        <IconButton 
                          size="small" 
                          onClick={() => copyText(msg.text)} 
                          sx={{ 
                            position: 'absolute', 
                            top: 6, 
                            right: 6, 
                            width: 32, 
                            height: 32, 
                            opacity: 0.8, 
                            backgroundColor: 'rgba(0,0,0,0.04)', 
                            '&:hover': { 
                              backgroundColor: 'rgba(0,0,0,0.1)',
                              opacity: 1 
                            } 
                          }}
                        >
                          <ContentCopyIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      )}
                    </Paper>

                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mt: 0.7, 
                        px: 1.5, 
                        opacity: 0.7, 
                        textAlign: msg.role === 'user' ? 'right' : 'left', 
                        color: msg.role === 'user' ? 'rgba(255,255,255,0.9)' : 'text.secondary',
                        fontSize: { xs: '0.7rem', sm: '0.75rem' }
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
                          background: 'linear-gradient(135deg, #90a4ae 0%, #607d8b 100%)' 
                        }}
                      >
                        {!me.avatar_url && <PersonIcon sx={{ fontSize: 18 }} />}
                      </Avatar>
                    </Zoom>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {/* ======= 📝 INDICADOR DE DIGITAÇÃO MELHORADO ======= */}
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 8, 
                  marginBottom: 16 
                }}
              >
                <Avatar 
                  src={LINA_AVATAR} 
                  alt="Lina" 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    boxShadow: `0 2px 8px ${themeColors.primary}40`, 
                    border: '2px solid #fff', 
                    bgcolor: themeColors.primary 
                  }} 
                />
                <Paper 
                  elevation={0} 
                  sx={{ 
                    px: 3.5, 
                    py: 2, 
                    backgroundColor: 'rgba(255,255,255,0.95)', 
                    borderRadius: '20px 20px 20px 8px', 
                    border: '1px solid rgba(0,0,0,0.06)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.7 
                  }}
                >
                  <Box 
                    component={motion.div} 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ duration: 1.4, repeat: Infinity }} 
                    sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: themeColors.primary }} 
                  />
                  <Box 
                    component={motion.div} 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.2 }} 
                    sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: themeColors.primary }} 
                  />
                  <Box 
                    component={motion.div} 
                    animate={{ opacity: [0.4, 1, 0.4] }} 
                    transition={{ duration: 1.4, repeat: Infinity, delay: 0.4 }} 
                    sx={{ width: 9, height: 9, borderRadius: '50%', backgroundColor: themeColors.primary }} 
                  />
                  {loadingMessage && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        ml: 1, 
                        color: themeColors.primary, 
                        fontWeight: 500 
                      }}
                    >
                      {loadingMessage}
                    </Typography>
                  )}
                </Paper>
              </motion.div>
            )}

            <div ref={chatEndRef} />
          </Box>

          <Zoom in={showScrollBottom}>
            <Badge color="success" invisible={!showScrollBottom} sx={{ position: 'fixed', right: 16, bottom: { xs: inputHeight + 24, sm: 24 }, zIndex: 20 }}>
              <Tooltip title="Ir para a última mensagem">
                <IconButton 
                  onClick={() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })} 
                  sx={{ 
                    background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`, 
                    color: '#fff', 
                    boxShadow: `0 4px 16px ${themeColors.primary}40` 
                  }}
                >
                  <KeyboardDoubleArrowDownIcon />
                </IconButton>
              </Tooltip>
            </Badge>
          </Zoom>
        </Box>

        {/* Input */}
        <Box 
          component="form" 
          ref={formRef} 
          onSubmit={enviarMensagem} 
          onPaste={handlePaste} 
          sx={{ 
            position: { xs: 'sticky', sm: 'relative' }, 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: { xs: 10, sm: 'auto' }, 
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.98), rgba(250,250,250,0.98))', 
            borderTop: '1px solid rgba(0,0,0,0.06)' 
          }}
        >
          <Box 
            ref={inputWrapRef} 
            sx={{ 
              ...centerColSx, 
              px: { xs: 1.5, sm: 3 }, 
              py: { xs: 1.5, sm: 2.2 }, 
              position: 'relative' 
            }}
          >
            {retryText && (
              <Alert 
                severity="warning" 
                sx={{ mb: 1.5 }} 
                action={
                  <Button 
                    color="inherit" 
                    size="small" 
                    startIcon={<RestartAltIcon />} 
                    onClick={handleRetry}
                  >
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
              placeholder='Digite sua pergunta… ou digite "/" para comandos rápidos'
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              onKeyDown={handleKeyDown}
              multiline
              maxRows={4}
              disabled={isTyping}
              inputRef={inputRef}
              helperText={
                <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                  <span>Shift+Enter: nova linha • "/": comandos • "/limpar": reinicia</span>
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
                            width: { xs: 42, sm: 44 }, 
                            height: { xs: 42, sm: 44 }, 
                            mr: 0.8, 
                            bgcolor: themeColors.primary, 
                            color: 'white', 
                            boxShadow: `0 4px 12px ${themeColors.primary}30`,
                            '&:hover': { 
                              bgcolor: themeColors.secondary,
                              boxShadow: `0 6px 16px ${themeColors.primary}40`,
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <PhotoCameraIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                          <input 
                            hidden 
                            type="file" 
                            accept="image/*" 
                            ref={fileInputRef} 
                            onChange={(e) => e.target.files && handleFile(e.target.files[0])} 
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
                            width: { xs: 42, sm: 44 }, 
                            height: { xs: 42, sm: 44 }, 
                            ml: 0.8, 
                            bgcolor: themeColors.secondary, 
                            color: 'white', 
                            boxShadow: `0 4px 12px ${themeColors.secondary}30`,
                            '&:hover': { 
                              bgcolor: themeColors.primary,
                              boxShadow: `0 6px 16px ${themeColors.secondary}40`,
                              transform: 'translateY(-1px)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {imgLoading || isTyping ? 
                            <CircularProgress size={20} sx={{ color: 'white' }} /> : 
                            <SendIcon sx={{ fontSize: { xs: 20, sm: 22 } }} />
                          }
                        </IconButton>
                      </span>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: { xs: '1rem', sm: '1.02rem' },
                  padding: { xs: '14px 10px', sm: '16px 12px' },
                  lineHeight: 1.5
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: { xs: '16px', sm: '18px' },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeColors.primary,
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: themeColors.secondary,
                    borderWidth: '2px',
                  }
                }
              }}
            />

            {/* Command Palette Popper */}
            <Popper 
              open={slashOpen && filteredSlash.length > 0} 
              anchorEl={inputWrapRef.current} 
              placement="top-start" 
              modifiers={[{ name: 'offset', options: { offset: [0, 8] } }]} 
              style={{ zIndex: 25 }}
            >
              <Paper 
                elevation={8} 
                sx={{ 
                  maxWidth: 520, 
                  width: { xs: '90vw', sm: 520 }, 
                  borderRadius: 3, 
                  overflow: 'hidden', 
                  border: '1px solid rgba(0,0,0,0.08)', 
                  boxShadow: '0 12px 32px rgba(0,0,0,0.15)' 
                }}
              >
                <Box sx={{ 
                  px: 2, 
                  py: 1.5, 
                  borderBottom: '1px solid rgba(0,0,0,0.06)', 
                  bgcolor: '#f8f9fa' 
                }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Comandos rápidos — use ↑/↓ e Enter
                  </Typography>
                </Box>
                <List dense disablePadding sx={{ maxHeight: 280, overflowY: 'auto' }}>
                  {filteredSlash.map((item, idx) => (
                    <ListItemButton 
                      key={item.cmd} 
                      selected={idx === slashIndex} 
                      onMouseEnter={() => setSlashIndex(idx)} 
                      onClick={() => applySlash(item)}
                      sx={{
                        py: 1.5,
                        '&.Mui-selected': {
                          bgcolor: `${themeColors.primary}10`,
                          '&:hover': {
                            bgcolor: `${themeColors.primary}15`,
                          }
                        }
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                            <Typography sx={{ 
                              fontFamily: 'monospace', 
                              fontWeight: 700, 
                              color: themeColors.primary, 
                              fontSize: '0.9rem' 
                            }}>
                              {item.cmd}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {item.label}
                            </Typography>
                          </Box>
                        }
                        secondary={item.template ? (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            sx={{ 
                              display: 'block', 
                              mt: 0.5,
                              lineHeight: 1.4,
                              fontSize: '0.75rem'
                            }}
                          >
                            {item.template.slice(0, 120)}{item.template.length > 120 ? '…' : ''}
                          </Typography>
                        ) : null}
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Popper>
          </Box>
        </Box>

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={3500} 
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} 
          sx={{ bottom: { xs: 'calc(100px + env(safe-area-inset-bottom))', sm: '32px' } }}
        >
          <Alert severity={snackbar.severity} sx={{ borderRadius: 2 }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>

      {/* Painel (desktop) */}
      {!isMobile && (
        <Box sx={{ 
          width: historyOpenDesktop ? HISTORY_WIDTH : 0, 
          transition: 'width .25s ease', 
          overflow: 'hidden', 
          borderLeft: historyOpenDesktop ? '1px solid rgba(0,0,0,0.08)' : 'none', 
          backgroundColor: '#fff' 
        }}>
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Typography variant="subtitle2">Histórico</Typography>
            <IconButton size="small" onClick={() => setHistoryOpenDesktop(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ height: 'calc(100% - 48px)', p: 1.5 }}>
            {renderHistoryList()}
          </Box>
        </Box>
      )}

      {/* Drawer (mobile) */}
      {isMobile && (
        <Drawer 
          anchor="right" 
          open={historyOpenMobile} 
          onClose={closeMobileHistory} 
          ModalProps={{ keepMounted: true }} 
          PaperProps={{ 
            sx: { 
              width: '90vw',
              borderRadius: '16px 0 0 16px'
            } 
          }}
        >
          <Box sx={{ 
            p: 2, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <Typography variant="subtitle2">Histórico</Typography>
            <IconButton size="small" onClick={closeMobileHistory}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Divider />
          <Box sx={{ height: '100%', p: 1.5 }}>
            {renderHistoryList()}
          </Box>
        </Drawer>
      )}
    </Box>
  );
}