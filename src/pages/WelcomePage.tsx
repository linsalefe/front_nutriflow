// src/pages/WelcomePage.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  MobileStepper,
  useTheme,
} from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const steps = [
  { title: 'Bem-vindo(a) à IA Nutricionista', subtitle: 'Seu assistente pessoal de saúde e nutrição.' },
  { title: 'Dashboard Personalizado', subtitle: 'Acompanhe peso, altura, IMC e progresso em tempo real.' },
  { title: 'Chat Inteligente', subtitle: 'Tire dúvidas sobre dieta, calorias e receba dicas.' },
  { title: 'Análise de Imagem', subtitle: 'Faça upload de fotos e receba análise nutricional automática.' },
];

export default function WelcomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    if (activeStep === steps.length - 1) navigate('/');
    else setActiveStep((prev) => prev + 1);
  };
  const handleBack = () => setActiveStep((prev) => prev - 1);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Box sx={{ textAlign: 'center', py: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant="h4" gutterBottom>
          {steps[activeStep].title}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {steps[activeStep].subtitle}
        </Typography>
      </Box>

      <MobileStepper
        steps={steps.length}
        position="static"
        activeStep={activeStep}
        nextButton={
          <Button size="small" onClick={handleNext}>
            {activeStep === steps.length - 1 ? 'Começar' : 'Próximo'}
            {theme.direction === 'rtl' ? <KeyboardArrowLeft /> : <KeyboardArrowRight />}
          </Button>
        }
        backButton={
          <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
            {theme.direction === 'rtl' ? <KeyboardArrowRight /> : <KeyboardArrowLeft />}
            Voltar
          </Button>
        }
        sx={{ width: '100%', maxWidth: 400, mt: 2, bgcolor: 'background.paper' }}
      />
    </Box>
  );
}
