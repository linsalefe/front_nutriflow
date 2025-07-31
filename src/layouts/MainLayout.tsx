import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { useLoading } from '../contexts/LoadingContext';
import LinearProgress from '@mui/material/LinearProgress';
import { useLocation } from 'react-router-dom';

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
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7fe' }}>
      <CssBaseline />

      {/* Sidebar */}
      <Sidebar mode={mode} onToggleMode={onToggleMode} />

      <Box
        component="main"
        sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <Header mode={mode} onToggleMode={onToggleMode} />
        <Toolbar sx={{ minHeight: 64 }} />

        {/* Loading bar */}
        {loading && (
          <LinearProgress
            sx={{ position: 'fixed', top: 64, left: 240, right: 0, zIndex: 1200 }}
          />
        )}

        {/* Page content with transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4 }}
            style={{ flex: 1, overflowY: 'auto' }}
          >
            <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>{children}</Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
