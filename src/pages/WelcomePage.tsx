// src/pages/WelcomePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Zoom,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ChatIcon from '@mui/icons-material/Chat';

const LEFT_SIDEBAR_WIDTH = 240;

// ======= 🎨 FUNÇÃO: Tema baseado na hora (mesma do ChatPage) =======
const getThemeByTime = () => {
  const hour = new Date().getHours();
  
  if (hour >= 6 && hour < 12) {
    // Manhã - cores frescas
    return {
      primary: '#4fc3f7', // azul claro
      secondary: '#81c784', // verde suave
      background: 'linear-gradient(135deg, #e1f5fe 0%, #f3e5f5 100%)',
      name: 'morning',
      greeting: 'Bom dia',
      motivational: 'Comece o dia cuidando da sua saúde! ☀️'
    };
  } else if (hour >= 12 && hour < 18) {
    // Tarde - cores neutras
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(135deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon',
      greeting: 'Boa tarde',
      motivational: 'Continue firme nos seus objetivos! 🌱'
    };
  } else {
    // Noite - cores quentes
    return {
      primary: '#ff8a65', // laranja suave
      secondary: '#ffb74d', // amarelo dourado
      background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening',
      greeting: 'Boa noite',
      motivational: 'Cuide-se sempre, você merece! 🌙'
    };
  }
};

const LINA_AVATAR = '/lina-avatar.png';

export default function WelcomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [themeColors, setThemeColors] = useState(getThemeByTime());

  // ======= 🎨 ATUALIZAR TEMA POR HORA =======
  useEffect(() => {
    const updateTheme = () => setThemeColors(getThemeByTime());
    updateTheme();
    
    const interval = setInterval(updateTheme, 60000); // a cada minuto
    return () => clearInterval(interval);
  }, []);

  const handleStartChat = () => {
    navigate('/chat');
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      height: { xs: '100dvh', md: 'calc(100vh - 64px)' }, 
      width: '100%', 
      position: 'relative', 
      background: themeColors.background,
      marginLeft: { xs: 0, md: `${LEFT_SIDEBAR_WIDTH}px` } 
    }}>
      <Box sx={{ 
        flex: '1 1 auto', 
        minWidth: 0, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: 'rgba(255,255,255,0.86)', 
        backdropFilter: 'blur(8px)', 
        boxShadow: { xs: 'none', md: '0 0 32px rgba(0,0,0,0.06)' } 
      }}>
        {/* Conteúdo principal centralizado */}
        <Box
          sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            px: { xs: 2, sm: 3 },
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Elementos decorativos de fundo */}
          <Box
            sx={{
              position: 'absolute',
              top: '10%',
              right: '15%',
              width: { xs: 60, sm: 80 },
              height: { xs: 60, sm: 80 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
              filter: 'blur(1px)',
              opacity: 0.6
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: '20%',
              left: '10%',
              width: { xs: 40, sm: 60 },
              height: { xs: 40, sm: 60 },
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${themeColors.secondary}25, ${themeColors.primary}25)`,
              filter: 'blur(1px)',
              opacity: 0.5
            }}
          />

          {/* Conteúdo principal */}
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: { xs: 350, sm: 480 },
              width: '100%',
              zIndex: 1
            }}
          >
            {/* Avatar da Lina */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 260,
                damping: 20
              }}
            >
              <Zoom in timeout={600}>
                <Avatar
                  src={LINA_AVATAR}
                  alt="Lina"
                  sx={{
                    width: { xs: 80, sm: 100 },
                    height: { xs: 80, sm: 100 },
                    mx: 'auto',
                    mb: 3,
                    boxShadow: `0 8px 32px ${themeColors.primary}40`,
                    border: '4px solid #fff',
                    bgcolor: themeColors.primary
                  }}
                />
              </Zoom>
            </motion.div>

            {/* Saudação */}
            <Fade in timeout={800}>
              <Typography
                variant={isMobile ? 'h4' : 'h3'}
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em'
                }}
              >
                {themeColors.greeting}!
              </Typography>
            </Fade>

            <Fade in timeout={1000}>
              <Typography
                variant={isMobile ? 'h6' : 'h5'}
                sx={{
                  fontWeight: 500,
                  mb: 2,
                  color: 'text.primary',
                  lineHeight: 1.3
                }}
              >
                Eu sou a Lina
              </Typography>
            </Fade>

            <Fade in timeout={1200}>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.1rem' }
                }}
              >
                Sua assistente nutricional inteligente
              </Typography>
            </Fade>

            {/* Botão principal */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<ChatIcon />}
                onClick={handleStartChat}
                sx={{
                  px: { xs: 4, sm: 6 },
                  py: { xs: 1.5, sm: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  borderRadius: { xs: '16px', sm: '20px' },
                  background: `linear-gradient(135deg, ${themeColors.primary} 0%, ${themeColors.secondary} 100%)`,
                  boxShadow: `0 8px 24px ${themeColors.primary}35`,
                  textTransform: 'none',
                  '&:hover': {
                    background: `linear-gradient(135deg, ${themeColors.secondary} 0%, ${themeColors.primary} 100%)`,
                    boxShadow: `0 12px 32px ${themeColors.primary}45`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Conversar com a Lina
              </Button>
            </motion.div>

            {/* Frase motivacional */}
            <Fade in timeout={1600}>
              <Typography
                variant="body2"
                sx={{
                  mt: 4,
                  color: 'text.secondary',
                  fontStyle: 'italic',
                  opacity: 0.8,
                  fontSize: { xs: '0.9rem', sm: '1rem' }
                }}
              >
                {themeColors.motivational}
              </Typography>
            </Fade>
          </Box>

          {/* Indicador sutil de funcionalidades */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 32, sm: 48 },
                display: 'flex',
                gap: 2,
                opacity: 0.6
              }}
            >
              <Typography variant="caption" color="text.secondary">
                💬 Chat inteligente
              </Typography>
              <Typography variant="caption" color="text.secondary">
                📸 Análise de imagem
              </Typography>
              <Typography variant="caption" color="text.secondary">
                📊 Acompanhamento nutricional
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}