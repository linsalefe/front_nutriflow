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
  useMediaQuery,
  useTheme,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import HistoryIcon from '@mui/icons-material/History';
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

const DRAWER_WIDTH = 240;

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
        <ListItemButton
          selected={isActive}
          sx={{
            mx: 1,
            mb: 0.5,
            borderRadius: 1.5,
            py: 1.25,
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
          <ListItemText
            primary={label}
            primaryTypographyProps={{ variant: 'body2', fontWeight: isActive ? 600 : 500 }}
          />
        </ListItemButton>
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" fontWeight={700}>
          NutriFlow
        </Typography>
      </Box>

      <Divider />

      <List sx={{ flex: 1, mt: 1 }}>
        <ItemLink to="/chat" label="Chat" icon={<ChatIcon />} />
        {isMobile && pathname.startsWith('/chat') && (
          <ItemLink to="/chat?history=1" label="Conversas" icon={<HistoryIcon />} />
        )}
        <ItemLink to="/image" label="Análise de Imagem" icon={<PhotoCameraIcon />} />
        <ItemLink to="/settings" label="Configurações" icon={<SettingsIcon />} />
      </List>

      <Divider />

      <List>
        <ListItemButton
          onClick={() => {
            onToggleMode();
            if (isMobile) onMobileClose();
          }}
          sx={{ mx: 1, mb: 0.5, borderRadius: 1.5, py: 1.25 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </ListItemIcon>
          <ListItemText
            primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'}
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
          />
        </ListItemButton>

        <ListItemButton
          onClick={handleLogout}
          sx={{ mx: 1, mb: 2, borderRadius: 1.5, py: 1.25 }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Sair"
            primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
          />
        </ListItemButton>
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
            boxShadow: isMobile ? 'none' : '4px 0 12px rgba(0,0,0,0.08)',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
}
