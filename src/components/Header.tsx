// src/components/Header.tsx
import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface HeaderProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  onMenuClick?: () => void;
}

// ======= 🎨 FUNÇÃO: Tema baseado na hora (mesma do ChatPage) =======
const getThemeByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Manhã - cores frescas
    return {
      primary: '#4fc3f7', // azul claro
      secondary: '#81c784', // verde suave
      background: 'linear-gradient(90deg, #e1f5fe 0%, #f3e5f5 100%)',
      name: 'morning'
    };
  } else if (hour >= 12 && hour < 18) {
    // Tarde - cores neutras
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(90deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon'
    };
  } else {
    // Noite - cores quentes
    return {
      primary: '#ff8a65', // laranja suave
      secondary: '#ffb74d', // amarelo dourado
      background: 'linear-gradient(90deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening'
    };
  }
};

export default function Header({
  mode,
  onToggleMode,
  onMenuClick,
}: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [themeColors, setThemeColors] = useState(getThemeByTime());

  // ======= 🎨 ATUALIZAR TEMA POR HORA =======
  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    
    const interval = setInterval(updateTheme, 60000); // a cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    const KEYS = ['nutriflow_token', 'token', 'access_token', 'auth_token', 'me'];
    KEYS.forEach(k => localStorage.removeItem(k));
    window.location.replace('/login');
  };

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,250,250,0.95) 100%)`,
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${themeColors.primary}20`,
        zIndex: theme.zIndex.drawer + 1,
        boxShadow: `0 2px 24px ${themeColors.primary}15`,
      }}
    >
      <Toolbar 
        sx={{ 
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Background decorativo sutil */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: themeColors.background,
            opacity: 0.3,
            zIndex: -1
          }}
        />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {isMobile && onMenuClick && (
            <IconButton
              edge="start"
              onClick={onMenuClick}
              sx={{ 
                mr: 0.5, 
                color: themeColors.primary,
                '&:hover': {
                  backgroundColor: `${themeColors.primary}15`,
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo + nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logoNF.svg"
              alt="NutriFlow"
              sx={{ 
                width: isMobile ? 22 : 26, 
                height: 'auto', 
                display: 'block',
                filter: `hue-rotate(${themeColors.name === 'morning' ? '0deg' : themeColors.name === 'afternoon' ? '90deg' : '180deg'})`,
                transition: 'filter 0.3s ease'
              }}
            />
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              noWrap
              sx={{ 
                background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontWeight: 700, 
                letterSpacing: 0.2,
                fontSize: isMobile ? '1.1rem' : '1.25rem'
              }}
            >
              NutriFlow
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton 
            onClick={onToggleMode} 
            aria-label="Alternar tema"
            sx={{
              color: themeColors.secondary,
              '&:hover': {
                backgroundColor: `${themeColors.secondary}15`,
                color: themeColors.primary,
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          
          <IconButton 
            onClick={handleLogout} 
            aria-label="Sair"
            sx={{
              color: '#f44336',
              '&:hover': {
                backgroundColor: '#f4433615',
                color: '#d32f2f',
                transform: 'scale(1.05)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
