// src/components/NutritionalAnalysis.tsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  useTheme,
} from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import GrainIcon from '@mui/icons-material/Grain';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

interface NutritionalAnalysisProps {
  text: string;
}

const NutritionalAnalysis: React.FC<NutritionalAnalysisProps> = ({ text }) => {
  const theme = useTheme();

  // Função para extrair informações do texto
  const extractInfo = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const foods: string[] = [];
    const nutrients = { calorias: '', proteinas: '', carboidratos: '', gorduras: '' };
    let tip = '';
    let warning = '';
    
    let currentSection = '';
    
    for (const line of lines) {
      // Detectar seções
      if (line.includes('🍽️') && line.toLowerCase().includes('alimentos')) {
        currentSection = 'foods';
        continue;
      } else if (line.includes('📊') && line.toLowerCase().includes('nutricion')) {
        currentSection = 'nutrients';
        continue;
      } else if (line.includes('💡') && line.toLowerCase().includes('dica')) {
        currentSection = 'tip';
        continue;
      } else if (line.includes('⚠️') && line.toLowerCase().includes('identifiquei')) {
        currentSection = 'warning';
        continue;
      }
      
      // Processar conteúdo baseado na seção
      if (currentSection === 'foods' && line.startsWith('-')) {
        foods.push(line.substring(1).trim());
      } else if (currentSection === 'nutrients') {
        if (line.includes('Calorias') || line.includes('calorias')) {
          const match = line.match(/(\d+)\s*kcal/i);
          if (match) nutrients.calorias = match[1];
        } else if (line.includes('Proteínas') || line.includes('proteinas')) {
          const match = line.match(/(\d+)\s*g/i);
          if (match) nutrients.proteinas = match[1];
        } else if (line.includes('Carboidratos') || line.includes('carboidratos')) {
          const match = line.match(/(\d+)\s*g/i);
          if (match) nutrients.carboidratos = match[1];
        } else if (line.includes('Gorduras') || line.includes('gorduras')) {
          const match = line.match(/(\d+)\s*g/i);
          if (match) nutrients.gorduras = match[1];
        }
      } else if (currentSection === 'tip' && !line.includes('💡')) {
        tip += line + ' ';
      } else if (currentSection === 'warning' && !line.includes('⚠️')) {
        warning += line + ' ';
      }
    }
    
    return { foods, nutrients, tip: tip.trim(), warning: warning.trim() };
  };

  const { foods, nutrients, tip, warning } = extractInfo(text);

  // Se não conseguiu extrair informações estruturadas, renderiza texto normal
  if (!foods.length && !nutrients.calorias && !tip) {
    return (
      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'pre-wrap',
          fontSize: { xs: '0.9rem', sm: '0.95rem' },
          lineHeight: 1.6,
          wordBreak: 'break-word',
        }}
      >
        {text}
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alimentos Identificados */}
      {foods.length > 0 && (
        <Card 
          sx={{ 
            mb: 2, 
            background: 'linear-gradient(135deg, #e8f5e8 0%, #f1f8e9 100%)',
            border: '1px solid rgba(102, 187, 106, 0.2)',
            boxShadow: '0 2px 8px rgba(102, 187, 106, 0.1)'
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <RestaurantIcon sx={{ color: '#66bb6a', mr: 1 }} />
              <Typography variant="h6" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                Alimentos Identificados
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {foods.map((food, index) => (
                <Chip
                  key={index}
                  label={food}
                  size="small"
                  sx={{
                    backgroundColor: '#66bb6a',
                    color: 'white',
                    fontWeight: 500,
                    '& .MuiChip-label': { px: 1.5 }
                  }}
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Informações Nutricionais */}
      {nutrients.calorias && (
        <Card 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, #fff3e0 0%, #fce4ec 100%)',
            border: '1px solid rgba(255, 152, 0, 0.2)',
            boxShadow: '0 2px 8px rgba(255, 152, 0, 0.1)'
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 600, mb: 2 }}>
              📊 Informações Nutricionais
            </Typography>
            <Grid container spacing={2}>
              {nutrients.calorias && (
                <Grid item xs={6} sm={3}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                      border: '1px solid rgba(244, 67, 54, 0.2)'
                    }}
                  >
                    <LocalFireDepartmentIcon sx={{ color: '#f44336', fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Calorias
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f44336', fontWeight: 700 }}>
                      {nutrients.calorias}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      kcal
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {nutrients.proteinas && (
                <Grid item xs={6} sm={3}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(63, 81, 181, 0.1)',
                      border: '1px solid rgba(63, 81, 181, 0.2)'
                    }}
                  >
                    <FitnessCenterIcon sx={{ color: '#3f51b5', fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Proteínas
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#3f51b5', fontWeight: 700 }}>
                      {nutrients.proteinas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      g
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {nutrients.carboidratos && (
                <Grid item xs={6} sm={3}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(255, 193, 7, 0.1)',
                      border: '1px solid rgba(255, 193, 7, 0.2)'
                    }}
                  >
                    <GrainIcon sx={{ color: '#ffc107', fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Carboidratos
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#f57c00', fontWeight: 700 }}>
                      {nutrients.carboidratos}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      g
                    </Typography>
                  </Box>
                </Grid>
              )}
              
              {nutrients.gorduras && (
                <Grid item xs={6} sm={3}>
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 1.5, 
                      borderRadius: 2, 
                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                      border: '1px solid rgba(156, 39, 176, 0.2)'
                    }}
                  >
                    <WaterDropIcon sx={{ color: '#9c27b0', fontSize: 28, mb: 0.5 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Gorduras
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#9c27b0', fontWeight: 700 }}>
                      {nutrients.gorduras}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      g
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Dica da Lina */}
      {tip && (
        <Card 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #e8eaf6 100%)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
            boxShadow: '0 2px 8px rgba(33, 150, 243, 0.1)'
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
              <LightbulbIcon sx={{ color: '#2196f3', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 600, mb: 1 }}>
                  Dica da Lina
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                  {tip}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Aviso de Correção */}
      {warning && (
        <Card 
          sx={{ 
            background: 'linear-gradient(135deg, #fff8e1 0%, #ffecb3 100%)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            boxShadow: '0 2px 8px rgba(255, 193, 7, 0.1)'
          }}
        >
          <CardContent sx={{ pb: '16px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
              <WarningAmberIcon sx={{ color: '#ff9800', mr: 1, mt: 0.5 }} />
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#f57c00', fontWeight: 600, mb: 0.5 }}>
                  Correção de Alimentos
                </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.6, color: '#ef6c00' }}>
                  {warning || 'Se identifiquei algum alimento errado, me informe para corrigir a análise nutricional.'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default NutritionalAnalysis;