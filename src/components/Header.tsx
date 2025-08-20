import React from 'react';
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

export default function Header({
  mode,
  onToggleMode,
  onMenuClick,
}: HeaderProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {isMobile && onMenuClick && (
            <IconButton
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 0.5, color: theme.palette.text.primary }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* Logo + Nome */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logoNF.svg"
              alt="NutriFlow"
              sx={{ width: isMobile ? 24 : 28, height: 'auto', display: 'block' }}
            />
            <Typography
              variant={isMobile ? 'subtitle1' : 'h6'}
              noWrap
              sx={{ color: theme.palette.text.primary, fontWeight: 600 }}
            >
              NutriFlow
            </Typography>
          </Box>
        </Box>

        <Box>
          <IconButton onClick={onToggleMode} color="inherit" aria-label="Alternar tema">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <IconButton onClick={handleLogout} color="inherit" aria-label="Sair">
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
