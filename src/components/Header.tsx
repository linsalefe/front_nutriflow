// src/components/Header.tsx
import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, useTheme, Box } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';

interface HeaderProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

export default function Header({ mode, onToggleMode }: HeaderProps) {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      color="default"
      elevation={0}
      sx={{
        borderBottom: `1px solid ${theme.palette.divider}`,
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Título do SaaS */}
        <Typography variant="h6" noWrap sx={{ color: theme.palette.text.primary }}>
          NutriFlow
        </Typography>

        <Box>
          {/* Toggle tema */}
          <IconButton onClick={onToggleMode} color="inherit">
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>

          {/* Botão de logout */}
          <IconButton
            onClick={() => {
              localStorage.removeItem('token');
              window.location.reload();
            }}
            color="inherit"
          >
            <ExitToAppIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
