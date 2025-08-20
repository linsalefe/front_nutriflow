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
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';

type Mode = 'light' | 'dark';

interface MainLayoutProps {
  mode: Mode;
  onToggleMode: () => void;
}

export default function MainLayout({ mode, onToggleMode }: MainLayoutProps) {
  const { loading } = useLoading();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const handleDrawerToggle = () => setMobileOpen(v => !v);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f4f7fe' }}>
      <CssBaseline />

      <Header mode={mode} onToggleMode={onToggleMode} onMenuClick={handleDrawerToggle} />

      <Sidebar
        mode={mode}
        onToggleMode={onToggleMode}
        mobileOpen={mobileOpen}
        onMobileClose={handleDrawerToggle}
      />

      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Toolbar sx={{ minHeight: 64 }} />

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
              <Outlet />
            </Box>
          </motion.div>
        </AnimatePresence>
      </Box>
    </Box>
  );
}
