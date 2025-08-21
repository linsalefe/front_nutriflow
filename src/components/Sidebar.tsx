// src/components/Sidebar.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useMediaQuery,
  useTheme,
  Avatar,
  Chip,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import CircleIcon from '@mui/icons-material/Circle';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface SidebarProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const DRAWER_WIDTH = 240;
const LINA_AVATAR = '/lina-avatar.png';

// ======= 🎨 FUNÇÃO: Tema baseado na hora (mesma do ChatPage) =======
const getThemeByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Manhã - cores frescas
    return {
      primary: '#4fc3f7', // azul claro
      secondary: '#81c784', // verde suave
      background: 'linear-gradient(180deg, #e1f5fe 0%, #f3e5f5 100%)',
      name: 'morning',
      greeting: 'Bom dia',
      status: 'Energia matinal! ☀️'
    };
  } else if (hour >= 12 && hour < 18) {
    // Tarde - cores neutras
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(180deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon',
      greeting: 'Boa tarde',
      status: 'Foco total! 🌱'
    };
  } else {
    // Noite - cores quentes
    return {
      primary: '#ff8a65', // laranja suave
      secondary: '#ffb74d', // amarelo dourado
      background: 'linear-gradient(180deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening',
      greeting: 'Boa noite',
      status: 'Relaxando! 🌙'
    };
  }
};

export default function Sidebar({
  mode,
  onToggleMode,
  mobileOpen,
  onMobileClose,
}: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [themeColors, setThemeColors] = useState(getThemeByTime());

  // ======= 🎨 ATUALIZAR TEMA POR HORA =======
  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    
    const interval = setInterval(updateTheme, 60000); // a cada minuto
    return () => clearInterval(interval);
  }, []);

  const ItemLink = ({
    to,
    label,
    icon,
    onClick,
  }: {
    to: string;
    label: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }) => (
    <NavLink
      to={to}
      style={{ textDecoration: 'none', color: 'inherit' }}
      onClick={() => {
        onClick?.();
        if (isMobile) onMobileClose();
      }}
    >
      {({ isActive }) => (
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <ListItemButton
            selected={isActive}
            sx={{
              mx: 1.5,
              mb: 0.8,
              borderRadius: 3,
              py: 1.4,
              px: 2,
              background: isActive 
                ? `linear-gradient(135deg, ${themeColors.primary}15, ${themeColors.secondary}15)` 
                : 'transparent',
              border: isActive ? `1px solid ${themeColors.primary}30` : '1px solid transparent',
              '&:hover': {
                background: isActive 
                  ? `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)` 
                  : `${themeColors.primary}08`,
                transform: 'translateX(2px)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 36,
              color: isActive ? themeColors.primary : 'text.secondary'
            }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{ 
                variant: 'body2', 
                fontWeight: isActive ? 600 : 500,
                color: isActive ? themeColors.primary : 'text.primary'
              }}
            />
          </ListItemButton>
        </motion.div>
      )}
    </NavLink>
  );

  const handleLogout = () => {
    ['nutriflow_token', 'token', 'access_token', 'auth_token', 'me'].forEach((k) =>
      localStorage.removeItem(k),
    );
    if (isMobile) onMobileClose();
    navigate('/login', { replace: true });
    // fallback contra histórico do navegador
    setTimeout(() => window.location.replace('/login'), 0);
  };

  const drawerContent = (
    <Box sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 120,
          background: themeColors.background,
          opacity: 0.8,
          zIndex: 0
        }}
      />

      {/* Header com avatar e saudação */}
      <Box sx={{ px: 2.5, py: 3, position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Avatar
            src={LINA_AVATAR}
            alt="Lina"
            sx={{
              width: 40,
              height: 40,
              boxShadow: `0 4px 16px ${themeColors.primary}30`,
              border: '2px solid #fff',
              bgcolor: themeColors.primary
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} sx={{ 
              background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              NutriFlow
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
              <CircleIcon sx={{ fontSize: 8, color: themeColors.secondary }} />
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                {themeColors.greeting}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Chip
          label={themeColors.status}
          size="small"
          sx={{
            fontSize: '0.7rem',
            height: 24,
            background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
            color: themeColors.primary,
            border: `1px solid ${themeColors.primary}30`,
            fontWeight: 500
          }}
        />
      </Box>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Menu principal */}
      <List sx={{ flex: 1, mt: 1, px: 0.5 }}>
        <ItemLink to="/" label="Início" icon={<HomeIcon />} />
        <ItemLink to="/chat" label="Chat com Lina" icon={<ChatIcon />} />
        {isMobile && pathname.startsWith('/chat') && (
          <ItemLink to="/chat?history=1" label="Conversas" icon={<HistoryIcon />} />
        )}
        <ItemLink to="/image" label="Análise de Imagem" icon={<PhotoCameraIcon />} />
        <ItemLink to="/settings" label="Configurações" icon={<SettingsIcon />} />
      </List>

      <Divider sx={{ mx: 2, opacity: 0.3 }} />

      {/* Menu inferior */}
      <List sx={{ pb: 2, px: 0.5 }}>
        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <ListItemButton
            onClick={() => {
              onToggleMode();
              if (isMobile) onMobileClose();
            }}
            sx={{ 
              mx: 1.5, 
              mb: 0.8, 
              borderRadius: 3, 
              py: 1.4,
              px: 2,
              '&:hover': {
                background: `${themeColors.primary}08`,
                transform: 'translateX(2px)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
              {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </ListItemIcon>
            <ListItemText
              primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            />
          </ListItemButton>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <ListItemButton
            onClick={handleLogout}
            sx={{ 
              mx: 1.5, 
              mb: 1, 
              borderRadius: 3, 
              py: 1.4,
              px: 2,
              '&:hover': {
                background: '#f4433620',
                color: '#f44336',
                transform: 'translateX(2px)',
              },
              transition: 'all 0.2s ease'
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: 'inherit' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Sair"
              primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
            />
          </ListItemButton>
        </motion.div>
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { sm: DRAWER_WIDTH }, flexShrink: { sm: 0 } }}>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 'none' : '8px 0 32px rgba(0,0,0,0.06)',
            background: 'transparent',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
