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
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'success' });
  const [imgLoading, setImgLoading] = useState(false);
  const { setLoading } = useLoading();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // 1) Carrega histórico salvo
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

  // scroll ao final
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [historico]);

  const saveMessage = async (msg: Mensagem) => {
    try {
      await api.post('/chat/save', msg);
    } catch {}
  };

  // envia texto
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
    setHistorico((h) => [...h, userMsg]);
    saveMessage(userMsg);
    setLoading(true);

    try {
      const { data } = await api.post<{ response: string }>('/chat/send', {
        message: text,
      });
      const botMsg: Mensagem = {
        role: 'bot',
        text: data.response,
        type: 'text',
        created_at: new Date().toISOString(),
      };
      setHistorico((h) => [...h, botMsg]);
      saveMessage(botMsg);
    } catch {
      const errMsg: Mensagem = {
        role: 'bot',
        text: 'Desculpe, houve um erro ao conectar.',
        type: 'text',
        created_at: new Date().toISOString(),
      };
      setHistorico((h) => [...h, errMsg]);
      saveMessage(errMsg);
    } finally {
      setLoading(false);
      setMensagem('');
    }
  };

  // envia imagem
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
    setHistorico((h) => [...h, userMsg]);
    saveMessage(userMsg);

    try {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post('/image/analyze', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const analysis =
        typeof data.analise === 'string'
          ? data.analise
          : JSON.stringify(data.analise);

      const botMsg: Mensagem = {
        role: 'bot',
        text: analysis,
        type: 'image',
        imageUrl: preview,
        created_at: new Date().toISOString(),
      };
      setHistorico((h) => [...h, botMsg]);
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
        flexDirection: { xs: 'column', md: 'row' },
        height: 'calc(100vh - 64px)',
        p: 2,
        gap: 2,
      }}
    >
      {/* Chat */}
      <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {/* Sugestões */}
          <Box sx={{ p: 2, display: 'flex', gap: 1, overflowX: 'auto' }}>
            {suggestions.map((s) => (
              <Chip key={s} label={s} clickable onClick={() => setMensagem(s)} />
            ))}
          </Box>
          {/* Histórico */}
          <Box sx={{ flex: 1, overflowY: 'auto', p: 2, bgcolor: 'grey.50' }}>
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
                <Box
                  sx={{
                    maxWidth: 400,
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'grey.300',
                    color: msg.role === 'user' ? 'primary.contrastText' : 'text.primary',
                    p: 1.5,
                    borderRadius:
                      msg.role === 'user' ? '12px 12px 0 12px' : '12px 12px 12px 0',
                    position: 'relative',
                  }}
                >
                  {msg.type === 'image' && msg.imageUrl && (
                    <Box sx={{ mb: 1 }}>
                      <img
                        src={msg.imageUrl}
                        alt=""
                        style={{ width: '100%', borderRadius: 6 }}
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
                </Box>
              </motion.div>
            ))}
            <div ref={chatEndRef} />
          </Box>
          {/* Envio */}
          <Box
            component="form"
            onSubmit={enviarMensagem}
            sx={{ p: 2, display: 'flex', gap: 1 }}
          >
            <TextField
              fullWidth
              placeholder="Digite sua pergunta..."
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              multiline
              maxRows={4}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton type="submit" disabled={!mensagem.trim() || imgLoading}>
                      {imgLoading ? <CircularProgress size={18} /> : <SendIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <IconButton component="label" disabled={imgLoading}>
              <PhotoCameraIcon />
              <input
                type="file"
                hidden
                accept="image/*"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFile(e.target.files[0])}
              />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Dicas */}
      <Box sx={{ flex: 1 }}>
        <Paper
          elevation={3}
          sx={{ height: '100%', p: 2, borderRadius: 2, overflowY: 'auto' }}
        >
          <Typography variant="h6" gutterBottom>
            Dicas Nutricionais
          </Typography>
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            <li>Beba pelo menos 2L de água por dia.</li>
            <li>Inclua verduras em metade do prato.</li>
            <li>Prefira gorduras saudáveis.</li>
            <li>Faça lanches com frutas e oleaginosas.</li>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
