// src/layouts/MainLayout.tsx
import React, { useState } from 'react';
import {
  Box,
  CssBaseline,
  Toolbar,
  useTheme,
  useMediaQuery,
  LinearProgress,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export default function MainLayout({
  children,
  mode,
  onToggleMode,
}: MainLayoutProps) {
  const { loading } = useLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7fe' }}>
      <CssBaseline />

      {/* Header com botão de menu no mobile */}
      <Header
        mode={mode}
        onToggleMode={onToggleMode}
        onMenuClick={handleDrawerToggle}
      />

      {/* Sidebar controlado por main */}
      <Sidebar
        mode={mode}
        onToggleMode={onToggleMode}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Espaço para o AppBar */}
        <Toolbar sx={{ minHeight: 64 }} />

        {/* Barra de loading */}
        {loading && (
          <LinearProgress
            sx={{
              position: 'fixed',
              top: 64,
              left: isMobile ? 0 : 240,
              right: 0,
              zIndex: theme.zIndex.drawer + 1,
            }}
          />
        )}

        {/* Conteúdo com animação de transição */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1, overflowY: 'auto' }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
              {children}
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
