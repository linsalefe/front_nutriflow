import React, { useState } from 'react';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ListIcon from '@mui/icons-material/List';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SettingsIcon from '@mui/icons-material/Settings';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { NavLink, useLocation } from 'react-router-dom';

interface SidebarProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const navItems = [
  { to: '/', label: 'Dashboard', icon: <DashboardIcon /> },
  { to: '/list', label: 'Listagem', icon: <ListIcon /> },
  { to: '/chat', label: 'Chat', icon: <ChatIcon /> },
  { to: '/image', label: 'Análise de Imagem', icon: <PhotoCameraIcon /> },
  { to: '/settings', label: 'Configurações', icon: <SettingsIcon /> },
];

export default function Sidebar({ mode, onToggleMode }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const toggle = () => setOpen(!open);

  const content = (
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
            sx={{
              mx: 1,
              mb: 0.5,
              borderRadius: 1.5,
              color: 'inherit',
              '&.active, &:hover': { bgcolor: theme.palette.primary.main },
              ...(pathname === to && { bgcolor: theme.palette.primary.main }),
            }}
            onClick={isMobile ? toggle : undefined}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
              {icon}
            </ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ bgcolor: theme.palette.primary.light, my: 1 }} />
      <ListItemButton
        onClick={() => {
          onToggleMode();
          if (isMobile) toggle();
        }}
        sx={{
          mx: 1,
          borderRadius: 1.5,
          color: 'inherit',
          '&:hover': { bgcolor: theme.palette.primary.main },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
        </ListItemIcon>
        <ListItemText primary={mode === 'light' ? 'Dark Mode' : 'Light Mode'} />
      </ListItemButton>
      <ListItemButton
        onClick={() => {
          localStorage.removeItem('token');
          window.location.reload();
        }}
        sx={{
          mx: 1,
          borderRadius: 1.5,
          color: 'inherit',
          '&:hover': { bgcolor: theme.palette.primary.main },
        }}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
          <SettingsIcon />
        </ListItemIcon>
        <ListItemText primary="Sair" />
      </ListItemButton>
    </Box>
  );

  return (
    <>
      {isMobile && (
        <IconButton
          color="inherit"
          onClick={toggle}
          sx={{ position: 'fixed', top: 8, left: 8, zIndex: theme.zIndex.drawer + 1 }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Box component="nav">
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? open : true}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: 240,
              boxSizing: 'border-box',
            },
          }}
        >
          {content}
        </Drawer>
      </Box>
    </>
  );
}
