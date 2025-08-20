// src/components/Sidebar.tsx
import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItems = [
  { to: '/chat', label: 'Chat', icon: <ChatIcon /> },
  { to: '/image', label: 'Análise de Imagem', icon: <PhotoCameraIcon /> },
  { to: '/settings', label: 'Configurações', icon: <SettingsIcon /> },
];

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

  const handleLogout = () => {
    const KEYS = ['nutriflow_token', 'token', 'access_token', 'auth_token', 'me'];
    KEYS.forEach(k => localStorage.removeItem(k));
    if (isMobile) onMobileClose();
    // Garantir saída das rotas privadas
    navigate('/login', { replace: true });
    // fallback para evitar cache de histórico
    setTimeout(() => window.location.replace('/login'), 0);
  };

  const drawerContent = (
    <Box
      sx={{
        width: 240,
        height: '100%',
        bgcolor: theme.palette.primary.dark,
        color: theme.palette.primary.contrastText,
        display: 'flex',
        flexDirection: 'column',
        pt: 2,
      }}
    >
      <Box sx={{ px: 2, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          NutriFlow
        </Typography>
      </Box>

      <Divider sx={{ bgcolor: theme.palette.primary.light }} />

      <List sx={{ flexGrow: 1, mt: 1 }}>
        {navItems.map(({ to, label, icon }) => (
          <ListItemButton
            key={to}
            component={NavLink}
            to={to}
            onClick={isMobile ? onMobileClose : undefined}
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1.5,
              py: 1.5,
              color: pathname === to ? theme.palette.primary.contrastText : 'rgba(255, 255, 255, 0.7)',
              bgcolor: pathname === to ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              transition: 'all 0.3s ease',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: theme.palette.primary.contrastText,
                transform: 'translateX(4px)',
              },
              '&.active': {
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                color: theme.palette.primary.contrastText,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              },
            }}
          >
            <ListItemIcon 
              sx={{ 
                minWidth: 40, 
                color: 'inherit',
                transition: 'transform 0.3s ease',
              }}
            >
              {icon}
            </ListItemIcon>
            <ListItemText 
              primary={label}
              primaryTypographyProps={{
                variant: 'body2',
                fontWeight: pathname === to ? 600 : 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>

      <Divider sx={{ bgcolor: theme.palette.primary.light, my: 1 }} />

      {/* Dark Mode Toggle */}
      <ListItemButton
        onClick={() => {
          onToggleMode();
          if (isMobile) onMobileClose();
        }}
        sx={{
          mx: 1,
          mb: 0.5,
          borderRadius: 1.5,
          py: 1.5,
          color: 'rgba(255, 255, 255, 0.7)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(255, 255, 255, 0.08)',
            color: theme.palette.primary.contrastText,
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </ListItemIcon>
        <ListItemText 
          primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 500,
          }}
        />
      </ListItemButton>

      {/* Logout Button */}
      <ListItemButton
        onClick={handleLogout}
        sx={{
          mx: 1,
          mb: 2,
          borderRadius: 1.5,
          py: 1.5,
          color: 'rgba(255, 255, 255, 0.7)',
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: 'rgba(244, 67, 54, 0.1)',
            color: '#ff5722',
            transform: 'translateX(4px)',
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          <LogoutIcon />
        </ListItemIcon>
        <ListItemText 
          primary="Sair"
          primaryTypographyProps={{
            variant: 'body2',
            fontWeight: 500,
          }}
        />
      </ListItemButton>
    </Box>
  );

  return (
    <Box component="nav">
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
            border: 'none',
            boxShadow: isMobile ? 'none' : '4px 0 12px rgba(0, 0, 0, 0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
