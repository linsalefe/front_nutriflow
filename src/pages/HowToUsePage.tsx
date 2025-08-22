// src/pages/HowToUsePage.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  useTheme,
  useMediaQuery,
  Fade,
  Chip,
  Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import ChatIcon from '@mui/icons-material/Chat';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import BarChartIcon from '@mui/icons-material/BarChart';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

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
      name: 'morning'
    };
  } else if (hour >= 12 && hour < 18) {
    // Tarde - cores neutras
    return {
      primary: '#66bb6a',
      secondary: '#4caf50',
      background: 'linear-gradient(135deg, #f5f7f5 0%, #ffffff 100%)',
      name: 'afternoon'
    };
  } else {
    // Noite - cores quentes
    return {
      primary: '#ff8a65', // laranja suave
      secondary: '#ffb74d', // amarelo dourado
      background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
      name: 'evening'
    };
  }
};

const LINA_AVATAR = '/lina-avatar.png';

const tutorialSteps = [
  {
    icon: <ChatIcon />,
    title: 'Converse com a Lina',
    description: 'Faça perguntas sobre nutrição, calorias e receba dicas personalizadas. A Lina está sempre pronta para ajudar!',
    examples: [
      'Quantas calorias tem uma banana?',
      'Como calcular minha necessidade calórica?',
      'Dicas para emagrecer com saúde'
    ]
  },
  {
    icon: <PhotoCameraIcon />,
    title: 'Análise de Imagens',
    description: 'Tire fotos dos seus alimentos e receba análise nutricional instantânea com calorias e macronutrientes.',
    examples: [
      'Fotografe seu prato de comida',
      'Receba análise nutricional detalhada',
      'Acompanhe seu consumo diário'
    ]
  },
  {
    icon: <RestaurantIcon />,
    title: 'Planejamento Alimentar',
    description: 'Use comandos rápidos para criar planos de refeições e definir suas metas nutricionais.',
    examples: [
      'Digite "/plano" para refeições do dia',
      'Use "/meta" para definir objetivos',
      'Comando "/calorias" para necessidades diárias'
    ]
  },
  {
    icon: <BarChartIcon />,
    title: 'Acompanhamento',
    description: 'Monitore seu progresso e veja resumos do seu consumo nutricional com o comando "/historico".',
    examples: [
      'Veja resumo diário de consumo',
      'Acompanhe metas de macronutrientes',
      'Receba sugestões de ajustes'
    ]
  }
];

const quickCommands = [
  { cmd: '/meta', desc: 'Definir metas nutricionais' },
  { cmd: '/plano', desc: 'Plano de refeições do dia' },
  { cmd: '/calorias', desc: 'Calcular necessidades calóricas' },
  { cmd: '/historico', desc: 'Ver resumo do consumo' },
  { cmd: '/ajuda', desc: 'Lista de comandos disponíveis' },
  { cmd: '/limpar', desc: 'Reiniciar conversa' }
];

export default function HowToUsePage() {
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

  return (
    <Box sx={{ 
      display: 'flex', 
      height: { xs: '100vh', md: 'calc(100vh - 64px)' }, 
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
        
        {/* Conteúdo scrollável */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            px: { xs: 1.5, sm: 3, md: 4 },
            py: { xs: 2, sm: 3, md: 4 },
            maxWidth: '920px',
            mx: 'auto',
            width: '100%'
          }}
        >
          {/* Cabeçalho */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4, md: 5 } }}>
              <Avatar
                src={LINA_AVATAR}
                alt="Lina"
                sx={{
                  width: { xs: 50, sm: 60, md: 80 },
                  height: { xs: 50, sm: 60, md: 80 },
                  mx: 'auto',
                  mb: { xs: 1.5, sm: 2 },
                  boxShadow: `0 8px 32px ${themeColors.primary}40`,
                  border: '3px solid #fff',
                  bgcolor: themeColors.primary
                }}
              />
              
              <Typography
                variant={isMobile ? 'h5' : 'h3'}
                sx={{
                  fontWeight: 700,
                  mb: { xs: 0.5, sm: 1 },
                  background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                }}
              >
                Como Usar o NutriFlow
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  maxWidth: { xs: '100%', sm: 600 },
                  mx: 'auto',
                  lineHeight: 1.6,
                  px: { xs: 1, sm: 0 }
                }}
              >
                Aprenda a aproveitar ao máximo sua assistente nutricional Lina e transforme sua relação com a alimentação
              </Typography>
            </Box>
          </motion.div>

          {/* Tutorial Steps */}
          <Box sx={{ mb: { xs: 3, sm: 4, md: 5 } }}>
            {tutorialSteps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Fade in timeout={800 + index * 200}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: { xs: 2, sm: 3, md: 4 },
                      mb: { xs: 2, sm: 3 },
                      borderRadius: { xs: 3, sm: 4 },
                      background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                      border: '1px solid rgba(0,0,0,0.06)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        boxShadow: `0 8px 32px ${themeColors.primary}15`,
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {/* Número do passo */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: { xs: -8, sm: -10 },
                        right: { xs: 15, sm: 20 },
                        width: { xs: 32, sm: 40 },
                        height: { xs: 32, sm: 40 },
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: { xs: '1rem', sm: '1.2rem' },
                        boxShadow: `0 4px 16px ${themeColors.primary}30`
                      }}
                    >
                      {index + 1}
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: 2, sm: 3 }, 
                      alignItems: 'flex-start',
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Box
                        sx={{
                          width: { xs: 50, sm: 60 },
                          height: { xs: 50, sm: 60 },
                          borderRadius: { xs: 2.5, sm: 3 },
                          background: `linear-gradient(135deg, ${themeColors.primary}20, ${themeColors.secondary}20)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: themeColors.primary,
                          flexShrink: 0,
                          alignSelf: { xs: 'center', sm: 'flex-start' }
                        }}
                      >
                        {React.cloneElement(step.icon, { sx: { fontSize: { xs: 24, sm: 28 } } })}
                      </Box>

                      <Box sx={{ flex: 1, minWidth: 0, textAlign: { xs: 'center', sm: 'left' } }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            mb: { xs: 0.5, sm: 1 },
                            color: themeColors.primary,
                            fontSize: { xs: '1.1rem', sm: '1.25rem' }
                          }}
                        >
                          {step.title}
                        </Typography>
                        
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            mb: { xs: 1.5, sm: 2 },
                            lineHeight: 1.6,
                            fontSize: { xs: '0.9rem', sm: '1rem' }
                          }}
                        >
                          {step.description}
                        </Typography>

                        <Box sx={{ 
                          display: 'flex', 
                          flexWrap: 'wrap', 
                          gap: { xs: 0.8, sm: 1 },
                          justifyContent: { xs: 'center', sm: 'flex-start' }
                        }}>
                          {step.examples.map((example, idx) => (
                            <Chip
                              key={idx}
                              label={example}
                              size="small"
                              sx={{
                                bgcolor: `${themeColors.secondary}15`,
                                color: themeColors.secondary,
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                height: { xs: 24, sm: 28 },
                                '&:hover': { bgcolor: `${themeColors.secondary}25` }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Fade>
              </motion.div>
            ))}
          </Box>

          {/* Comandos Rápidos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                background: `linear-gradient(135deg, ${themeColors.primary}08, ${themeColors.secondary}08)`,
                border: `1px solid ${themeColors.primary}20`,
                mb: 4
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <TipsAndUpdatesIcon sx={{ color: themeColors.primary, fontSize: 32 }} />
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    color: themeColors.primary
                  }}
                >
                  Comandos Rápidos
                </Typography>
              </Box>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                Digite "/" no chat para acessar comandos rápidos e acelerar sua experiência:
              </Typography>

              <Box sx={{ 
                display: 'grid', 
                gap: { xs: 1.5, sm: 2 }, 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' } 
              }}>
                {quickCommands.map((command, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: { xs: 1.5, sm: 2 },
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 700,
                        color: themeColors.primary,
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        minWidth: { xs: 70, sm: 80 }
                      }}
                    >
                      {command.cmd}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ 
                        color: 'text.secondary', 
                        fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        lineHeight: 1.4
                      }}
                    >
                      {command.desc}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </motion.div>

          {/* Dicas Finais */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #fafafa 100%)',
                border: '1px solid rgba(0,0,0,0.06)',
                textAlign: 'center'
              }}
            >
              <FitnessCenterIcon sx={{ color: themeColors.secondary, fontSize: 48, mb: 2 }} />
              
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  color: themeColors.primary
                }}
              >
                Pronto para Começar?
              </Typography>
              
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 3,
                  lineHeight: 1.6,
                  maxWidth: 500,
                  mx: 'auto'
                }}
              >
                Agora que você conhece todas as funcionalidades, comece sua jornada nutricional! 
                A Lina está sempre aqui para ajudar você a alcançar seus objetivos de saúde.
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Chip
                  label="💡 Seja específico nas perguntas"
                  sx={{
                    bgcolor: `${themeColors.primary}15`,
                    color: themeColors.primary,
                    fontWeight: 500
                  }}
                />
                <Chip
                  label="📸 Use fotos para análises precisas"
                  sx={{
                    bgcolor: `${themeColors.secondary}15`,
                    color: themeColors.secondary,
                    fontWeight: 500
                  }}
                />
                <Chip
                  label="🎯 Defina metas realistas"
                  sx={{
                    bgcolor: `${themeColors.primary}15`,
                    color: themeColors.primary,
                    fontWeight: 500
                  }}
                />
              </Box>
            </Paper>
          </motion.div>
        </Box>
      </Box>
    </Box>
  );
}